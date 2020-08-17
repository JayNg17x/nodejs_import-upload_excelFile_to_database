const mysql = require('mysql');
const multer = require('multer');
const express = require('express');

const readXlsxFile = require('read-excel-file/node');

const app = express();
 
global.__basedir = __dirname;

// Multer Upload Storage
const storage = multer.diskStorage({
	destination: (req, file, cb) => {
	   cb(null, __basedir + '/uploads/')
	},
	filename: (req, file, cb) => {
	   cb(null, file.fieldname + "-" + Date.now() + "-" + file.originalname)
	}
});

const upload = multer({storage: storage});

// -> Express Upload RestAPIs
app.post('/api/uploadfile', upload.single("uploadfile"), (req, res) =>{
	importExcelData2MySQL(__basedir + '/uploads/' + req.file.filename);
	res.json({
		message: 'File uploaded/import successfully!', 'file': req.file
	});
});


function importExcelData2MySQL(filePath) {
	// file path
	readXlsxFile(filePath).then((rows) => {
		// `rows` is an array of rows
		// each row being an array of cells.	 
		console.log(rows);
	 
		// Remove Header ROW
		rows.shift();
	 
		// Create a connection to the database
		const connection = mysql.createConnection({
			host: 'localhost',
			user: 'root',
			password: 'root',
			database: 'XLSXFILE',
			socketPath: '/Applications/MAMP/tmp/mysql/mysql.sock'
		});
	 
		// Open the MySQL connection
		connection.connect((err) => {
			if (err) {
				console.error(err.message);
			} else {
				console.log('Conneted to database...');
				let query = 
				'INSERT INTO `Sample` (`First Name`, `Last Name`, `Purchase Price`, `Payments Made`, `Amount Remaining`, `Remaining`) VALUES ?';
				connection.query(query, [rows], (err, result) => {
					if(err) console.error('query failed!', err.message);
					else {
						console.log(result);
					}
				});
			}
		});
	}).catch(err => {
		console.error(err.message);
	});
}

// Create a Server
let port = process.env.PORT || 3002;
app.listen(port, () => {
	console.log(`App is running on port ${port}`);
});


