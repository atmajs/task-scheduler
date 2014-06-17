require('atma-libs/globals');
process.on('exit', shutdownSelf);
process.on('SIGINT', shutdownSelf);
process.on('uncaughtException', function(error){
    send(error.stack);
    send(error);
    server_Shutdown();
    send('fail');
});

var logger = require('atma-logger'),
    Config = require('appcfg'),
    Monitor = require('forever-monitor').Monitor
    ;

global.threads = [];
global.config = null;

Config
    .fetch({
        path: '%APPDATA%/.taskd/server.json',
        writable: true,
        optional: true
    })
    .done(function(cfg){
        config = cfg;
        server_Shutdown()
        
        if (cfg.$cli.params.stop) {
            disconnect();
            return;
        }
        
        config.$set('pid.monitor', process.pid);
        config.$set('pid.server', null);
        config.$set('pid.workers', []);
        
        server_Start();
    });

function server_Start(){
    startServer(function(error){
        if (error) 
            return disconnect(error);
        
        
        var count = config.workers || 1,
            i = count;
        if (i === 0) {
            workerStarted();
            return;
        }
        
        while(--i > -1){
            startWorker(workerStarted);
        }
        function workerStarted(error) {
            if (error) 
                send(error);
            if (--count > -1) 
                return;
            
            config
                .$write({
                    pid: config.pid
                })
                .fail(disconnect)
                .done(function(){
                    var msg = logger.formatMessage(
                        'Server process: bold<%s>'.color
                        , config.pid.server
                    );
                    config.pid.workers.forEach(function(pid, index){
                        msg += logger.formatMessage(
                            'Worker green<%s> process: bold<%s>'.color
                            , index
                            , pid
                        );
                    });
                    
                    send(msg)
                    disconnect();
                });
        }
    });
        
}
function startServer(cb) {
    fork('App/index.js', function(error, thread){
        if (error)  return cb(error);
        
        config.$set('pid.server', thread.child.pid);
        cb();
    });
}
function startWorker(cb) {
    fork('Worker/index.js', function(error, thread){
        if (error)  return cb(error);
        
        config.$get('pid.workers').push(thread.child.pid);
        cb();
    });
}
function server_Shutdown(){
    kill(config.$get('pid.server'));
    kill(config.$get('pid.workers'));
    kill(config.$get('pid.monitor'));
    
    function kill(pid) {
        if (pid == null) 
            return;
        if (Array.isArray(pid)) {
            pid.forEach(kill);
            return;
        }
        
        try {
            process.kill(pid, 'SIGINT');
        } catch(error) {}
    }
}
function shutdownSelf() {
    threads.forEach(function(thread){
        thread.kill(true);
    });
    process.exit(0);
}


function fork(path, cb){
    var thread = new Monitor(path, {
        max: 2,
        silent: true,
        killSignal: 'SIGINT',
        killTree: false,
        spawnWith: {
            detached: true
        }
    });
    threads.push(thread);
    thread
        .on('start', function(){
            
            cb(null, thread);
        })
        .on('stop', function(error){
            send('stopped'.bold);
            cb('stopped: ' + path);
        })
        .on('error', function(error){
            send('errored '.bold + error);
            cb(error)
        })
        .on('restart', function(a, b) {
            send('Failed to start: ' + path);
        })
        .on('exit:code', function(code, x) {
            //send('Forever detected script exited with code ' + code);
            
        })
        .on('stdout', function(data){
            send(path + ' [stdout]: ' + String(data));
        })
        .on('stderr', function(data){
            send(path + ' [stderr]: ' + String(data));
        })
        ;
    
    thread.start();
}

function send() {
    var msg = logger.formatMessage.apply(logger, arguments);
    if (process.send) {
        // send to parents process
        process.send(msg);
        return;
    }
    console.log(msg);
}
function disconnect(error) {
    if (error == null) {
        send('ok');
        return;
    }
    send(error);
    send('fail');
}