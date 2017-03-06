var juickTag;
var juickLastMid;


function setRandomTopic() {
  var title = titles[Math.floor(Math.random()*titles.length)];
  console.log('New title: ' + title);
  $('#hdr-text').text(title);
}

function juickInit(uname) {
  setRandomTopic();
  var message=juickGetHashVar("message");
  juickTag=juickGetHashVar("tag");
  juickLastMid=juickGetHashVar("before_mid");
  if(juickLastMid) juickLastMid=parseInt(juickLastMid);
  if(!juickLastMid) juickLastMid=0;

  var msgs=document.getElementById("messages");
  while(msgs.hasChildNodes()) msgs.removeChild(msgs.lastChild);
  var replies=document.getElementById("replies");
  while(replies.hasChildNodes()) replies.removeChild(replies.lastChild);
  document.getElementById("navigation").style.display="none";

  var nodes=document.getElementsByClassName("loadScript");
  for(var i=0; i<nodes.length; i++)
    nodes[i].parentNode.removeChild(nodes[i]);
  if(message && message>0) {
    var url="http://api.juick.com/thread?mid="+message+"&callback=juickParseThread";
    juickLoadScript(url);
  } else {
    var url="http://api.juick.com/messages?uname="+uname;
    if(juickTag && juickTag!='') url+="&tag="+encodeURI(juickTag);
    if(juickLastMid && juickLastMid>0) url+="&before_mid="+juickLastMid;
    url+="&callback=juickParseMessages";
    juickLoadScript(url);
  }
}

function juickLoadScript(src) {
  var scripttag=document.createElement("script");
  scripttag.setAttribute("type","text/javascript");
  scripttag.setAttribute("src",src);
  scripttag.setAttribute("class","loadScript");
  document.getElementsByTagName("head")[0].appendChild(scripttag);
}

function juickParseMessages(json) {
  var msgs=document.getElementById("messages");
  for(var i=0; i<json.length; i++) {
    juickLastMid = json[i].mid;
    var ts=json[i].timestamp.split(/[\-\s]/);
    var date=new Date(ts[0],ts[1]-1,ts[2]);
    var ihtml='<div class="date"><div class="day">'+date.getDate()+'</div><div class="month">'+date.getMonthName()+'</div><div class="year">'+(1900+date.getYear())+'</div></div>';

    if(json[i].tags) {
      ihtml+='<div><ul class="tags">';
      for(var n=0; n<json[i].tags.length; n++)
        ihtml+='<li><a href="#tag='+json[i].tags[n]+'">'+json[i].tags[n]+'</a></li>';
      ihtml+='</ul></div>';
    }

    ihtml+='<div class="text">';
    if(json[i].photo)
      ihtml+='<div class="photo"><a href="'+json[i].photo.medium+'"><img src="'+json[i].photo.small+'" alt="Photo"/></a></div>';
    if(json[i].video)
      ihtml+='<b>Attachment:</b> <a href="'+json[i].video.mp4+'">Video</a><br/>';
    if(json[i].location)
      ihtml+='<b>Location:</b> <a href="/places/'+json[i].location.place_id+'">'+json[i].location.name+'</a><br/>';
    ihtml+=juickFormatText(json[i].body);
    ihtml+='</div>';



    var replies=json[i].replies;
    if(!replies) replies=0;
    ihtml+='<div class="replies"><a href="#message='+json[i].mid+'">'+juickReplies+': '+replies+'</a></div>';

    var li=document.createElement("li");
    li.innerHTML=ihtml;
    msgs.appendChild(li);
  }

  var nav="";
  if(juickLastMid>0 && json.length==20) nav+=' &nbsp; ';
  if(json.length>15) {
    nav+='<a href="#';
    if(juickTag && juickTag!='') nav+='tag='+juickTag+'&';
    nav+='before_mid='+(juickLastMid);
    nav+='">'+juickOlder+'</a>';
  }
  if(nav!="") {
    document.getElementById("navigation").innerHTML=nav;
    document.getElementById("navigation").style.display="block";
  }
  $('.media').embedly({
    key: '28b3d1f4d2484dae8d8dc203320dd253',
    query: {
      maxwidth: 800
    }
  });
}

function juickParseThread(json) {
  var msg=new Array();
  msg[0]=json[0];
  juickParseMessages(msg);

  var replies=document.getElementById("replies");
  for(var i=1; i<json.length; i++) {

    var ihtml='<div class="username"><a href="http://juick.com/'+json[i].user.uname+'/">@'+json[i].user.uname+'</a>:</div>';

    ihtml+='<div class="text">';
    if(json[i].photo)
      ihtml+='<div class="photo"><a href="'+json[i].photo.medium+'"><img src="'+json[i].photo.small+'" alt="Photo"/></a></div>';
    if(json[i].video)
      ihtml+='<b>Attachment:</b> <a href="'+json[i].video.mp4+'">Video</a><br/>';
    ihtml+=juickFormatText(json[i].body);
    ihtml+='</div>';

    var li=document.createElement("li");
    li.style.backgroundImage='url(http://i.juick.com/as/'+json[i].user.uid+'.png)';
    li.innerHTML=ihtml;
    replies.appendChild(li);
  }

  var disq=document.createElement("div");
  disq.innerHTML='<div id="disqus_thread"></div>';
  replies.appendChild(disq);
  var disqus_config = function () {
  this.page.url = netneladno.ru;  // Replace PAGE_URL with your page's canonical URL variable
  this.page.identifier = PAGE_IDENTIFIER; // Replace PAGE_IDENTIFIER with your page's unique identifier variable
  };
  (function() { // DON'T EDIT BELOW THIS LINE
  var d = document, s = d.createElement('script');
  s.src = 'https://netneladno-ru.disqus.com/embed.js';
  s.setAttribute('data-timestamp', +new Date());
  (d.head || d.body).appendChild(s);
  })();
}

function juickGetHashVar(variable) {
  var query=window.location.hash.substring(1);
  var vars=query.split("&");
  for(var i=0; i<vars.length; i++) {
    var pair=vars[i].split("=");
    if(pair[0]==variable) return pair[1];
  }
}

function juickFormatText(txt) {
  //console.log(txt);
  //txt=txt.replace("<","&lt;").replace(">","&gt;").replace("\"","&quot;");
  txt=txt.replace(/\n/g,"<br/>");
  txt = urlify(txt);
  //console.log('After urlify: ', txt)
  return txt;
}

function is_img(url){
  var imgRegex = /\.(jpg|png|gif|jpeg|svg)((\?|:).+)?$/;
  return imgRegex.test(url);
}

function classify(url){
  if (is_img(url)){
    return 'image'
  } else if (/(youtube|youtu).(com|be)/.test(url)){
    return 'youtube'
  } else if (/vimeo.com/.test(url)){
    return 'vimeo'
  } else if (/reddituploads/.test(url)) {
    return 'image'
  } else if (/^https?:\/\/(?:i.)?imgur.com/.test(url)) {
    return 'imgur'
  } else if (/coub.com/.test(url)){
    return 'coub'
  } else if (/twitter.com/.test(url)){
    return 'twitter'
  } else if (/gfycat.com/.test(url)){
    return 'media'
  } else if (/instagram.com\/p/.test(url)){
    return 'media'
  } else {
    return 'other'
  }
}

function get_youtubeid(url){

  if (url.indexOf('youtube.com') >= 0){
    var video_id = url.split('v=')[1];

  } else if (url.indexOf('youtu.be') >= 0) {
    var s = url.split('/');
    var video_id = s[s.length-1];
  }
  if (!video_id){ return };
  var ampersandPosition = video_id.indexOf('&');
  if(ampersandPosition != -1) {
    video_id = video_id.substring(0, ampersandPosition);
  }
  return video_id
}

function get_imgurid(url){
  console.log(url);
    var r = /imgur.com\/(?:gallery\/)?(?:a\/)?(\w+)(?:\..+)?/;
  if (r.test(url)) {
    var i = url.match(r)[1];
    if (i.length >= 7){
      return i;
    } else {
      return 'a/'+i;
    }
  } else {
    return ''
  }
}

function urlify(text) {
  var adiumUrlRegex = /<((https?|ftp)(:\/\/[^\s()<>]+))>/g;
  if (adiumUrlRegex.test(text)){
    text = text.replace(adiumUrlRegex, function(_, inner){
      return ' '+inner+' '
    });
  }
  var urlRegex = /(https?|ftp)(:\/\/[^\s()<>]+)/g;

  return text.replace(urlRegex, function(url) {
    var cls = classify(url);
    if (cls == 'image'){
      return '<a class="media" href="' + url + '">'+decodeURIComponent(url)+'</a>';
    } else if (cls == 'youtube' && get_youtubeid(url)){
      return '<a class="media" href="' + url + '">'+decodeURIComponent(url)+'</a>';
    } else if (cls == 'coub') {
      return '<a class="media" href="' + url + '">'+decodeURIComponent(url)+'</a>';
    } else if (cls == 'media') {
      return '<a class="media" href="' + url + '">'+decodeURIComponent(url)+'</a>';
    } else if (cls == 'vimeo') {
      return '<a class="media" href="' + url + '">'+decodeURIComponent(url)+'</a>';
    } else if (cls == 'imgur'){
      return '<a class="media" href="' + url + '">'+decodeURIComponent(url)+'</a>';
    } else if (cls == 'twitter'){
      var twid = url.match(/\/(\d+)$/)[1];
      console.log('twid: ', twid);
      var s = document.createElement('script');
      s.type = 'text/javascript';
      s.src = 'https://platform.twitter.com/widgets.js';
      s.async = true;
      setTimeout(function(){
        console.info('Append ', s, ' to ', document.body);
        document.body.appendChild(s);
      }, 300);
      return '<blockquote class="twitter-tweet"><a href="'+url+'"></a></blockquote>';
    } else {
      return '<a class="a_other" href="' + url + '">'+decodeURIComponent(url)+'</a>';
    }
  })
}
