const express = require('express');
const seats = require('./seats.js');
const port = 3000;
const app = express();
app.use(express.json());
//get seats info using
//get routes
app.get('/', (req, res)=>{
	res.json({
			"message": "Welcome to Ticket Booking API",
			"endpoints": {
			"seats": "/seats"
  }});
})
//get seats
app.get('/seats', (req, res)=>{
	let results = seats.seats;
	const queryFilter = req.query;
	if(queryFilter.status){
		results = results.filter((seatObj)=>seatObj.status === queryFilter.status);
	}
	if(queryFilter.row){
		results = results.filter((seatObj)=>seatObj.row.toLowerCase() === queryFilter.row.toLowerCase());
	}

	if(results.length<=0){
		return res.status(200).json({queryFilter,message:"no data available for this filter"})
	}
	res.status(200).json({message:`seats`,queryFilter,results})
})


app.listen(port ,()=>{
	console.log(`Server started at http://localhost:${port}` );
	
})
