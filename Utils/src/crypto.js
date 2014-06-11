include
	.js('/node_modules/spark-md5/spark-md5.min.js::SparkMD5')
	.done(function(resp){
		var md5 = resp.SparkMD5 || SparkMD5;
		
		include.exports = {
			md5: function(str) {
				return md5.hash(str);
			}
		}
	});
	