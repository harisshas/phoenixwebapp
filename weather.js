const https=require("https");
module.exports.getweatherimageurl=getweatherimageurl;
function getweatherimageurl()
{
    const url="https://api.openweathermap.org/data/2.5/weather?lat=10.809&lon=78.6988&appid=59df6b279dbca9946fc700568bb0b6f3&units=metric";
        https.get(url,function(resp)
        {
            //console.log("response code is:"+resp.statusCode);
            resp.on("data",function(data)
            {
                var imageurl="http://openweathermap.org/img/wn/"+JSON.parse(data).weather[0].icon+"@2x.png"
                console.log(imageurl);
            });
        });
}
        
        
        