//export NODE_ENV=production // on production env...
if (process.env.NODE_ENV !== 'production') {
  require('dotenv').config()
}

const express = require('express');
const app = express();
const axios = require('axios');
const bodyParser = require('body-parser'); // Import the body-parser middleware
const path = require('path')
const PORT = process.env.PORT || 4463;

// loggers
const morgan = require('morgan')
app.use(morgan('dev'))

// view engine and static public...
app.set('view engine', 'ejs')
app.use('/public', express.static(path.join(__dirname, 'public')));

// Add the body-parser middleware to parse the request body
app.use(bodyParser.urlencoded({ extended: true }));
/// Routers..
// Define a route to handle weather data requests
app.get('/', async (req, res) => {
  res.status(200).render('home.ejs',(err,html)=>{
    if (err) {
      res.status(500).send('500 Internal Server Error');
    } else {
      res.send(html);
    }
  })
});

// Use a POST request handler to handle form submissions
app.post('/',async (req, res) => {
  try{
    const myInputValue = req.body.myInput;
    // Make an HTTP request to the weather service API  countruoutput
    const response = await axios.get(`http://api.openweathermap.org/data/2.5/weather?q=${myInputValue}&APPID=${process.env.WEATHER_API_KEY}`);

    // Extract the relevant weather data
    const data = response.data;
    const weather = {
      date:response.headers.date,
      countryName: `${data.name}, ${data.sys.country}`,
      lon_lat: `${data.coord.lon}, ${data.coord.lat}`,
      temperature: `${data.main.temp}`,
      pressure:`${data.main.pressure}`,
      humadity:`${data.main.humidity}`,
      sunrise:`${data.sys.sunrise}`,
      sunset:`${data.sys.sunset}`,
      speed_deg_gust:`${data.wind.speed},${data.wind.deg},${data.wind.gust}`,
      description: data.weather[0].description
    }
    res.status(200).render('weatherTemplate',{
      date:weather.date,
      countryName:`${weather.countryName}`,
      lonlat:`${weather.lon_lat}`,
      temperature:`${weather.temperature}`,
      pressure:`${weather.pressure}`,
      humidity:`${weather.humadity}`,
      sunrise:`${weather.sunrise}`,
      sunset:`${weather.sunset}`,
      speed_deg_gust:weather.speed_deg_gust,
      description:weather.description
    })
  }catch(err){
    if (err.hostname) {
      console.error(err.hostname)
      res.status(500).send('500 (Internal Server Error)')
    } else {
      res.render('home',{
        error:`Invalid Input`
      })
    }
  }
})

// 404 not found !.
app.use((req,res)=>{
  res.status(200).render('404',{
    notfound:"404 Not Found !."
  })
})

// Start the server
app.listen(PORT, () => {
  console.log(`Server started on port ${PORT}`);
});



