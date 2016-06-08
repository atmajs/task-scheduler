include.exports = atma.server.HttpService({
	'$get /io/directory/list' : {
		meta: {
			description: 'Query folders',
			arguments: {
				path: 'string'
			}
		},
		process (req, res, params) {
			var uri = new net.Uri(params.path),
				directory = uri.toLocalDir() + '*';
				
			io
				.glob
				.readAsync(directory, (err, entries) => {
					if (err) {
						this.reject(err);
						return;
					}
					this.resolve({
						entries: entries.map(x => {
							
							return x instanceof io.Directory
								? x.uri.toLocalDir()
								: x.uri.toLocalFile();
						})
					});
				});
		}
	},
	'$get /io/stat': {
		meta: {
			description: 'Get Stats for the path',
			arguments: {
				path: 'string'
			},
			response: {
				directory: 'boolean',
				file: 'boolean',
				size: 'number'
			}
		},
		process (req, res, params) {
			var path = params.path;
			require('fs').lstat(path, (err, stat) => {
				if (err) {
					var status = ({34: 404})[err.errno];
					return this.reject({
						status: status || 500,
						message: String(err)
					});
				}
				
				this.resolve({
					directory: stat.isDirectory(),
					file: stat.isFile(),
					size: stat.size
				});
			});
		}
	}
})