module.exports.getkey=getkey;
function getkey()
{
    var key="";
    for(var i=0;i<16;i++)
    {
        var numalph=Math.floor(Math.random()*26);
        //console.log(numalph);
        var num = String.fromCharCode(97 + numalph);
        key+=num;
    }
    return(key);
}