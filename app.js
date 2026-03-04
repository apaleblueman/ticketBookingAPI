const express = require('express');
const seats = require('./seats.js');
const { chkValidEntry, chkAvailability } = require('./booking.js');
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
	if(queryFilter.status){results = results.filter((seatObj)=>seatObj.status === queryFilter.status);}
	if(queryFilter.row){results = results.filter((seatObj)=>seatObj.row.toLowerCase() === queryFilter.row.toLowerCase());}
	if(results.length<=0){
		return res.status(200).json({queryFilter,message:"no data available for this filter"})
	}
	res.status(200).json({message:`seats`,queryFilter,results})
})

//Booking info
app.post('/bookings', (req, res)=>{
	const userInfo = req.body;
	var validityFlag = true;
	if(!userInfo.mobile || userInfo.mobile.length !== 10 || !userInfo.seats || userInfo.seats.length > 10 || userInfo.seats.length <= 0){
		validityFlag = false;
	}
	//remove duplicates
	userInfo.seats = [...new Set(userInfo.seats)];

	userInfo.seats.forEach(seatElement => {
		if(!(chkValidEntry(seatElement)) || !(chkAvailability(seatElement, seats.seats))){
			validityFlag = false;
		}
	});
	if(!validityFlag){
		return res.status(400).json({message:"invalid or missing details"});
	}
	res.status(200).json({message:"data valid",userInfo});

})
app.listen(port ,()=>{
	console.log(`Server started at http://localhost:${port}` );
	
})
