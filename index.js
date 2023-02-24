
class Toast {
constructor(message,color,time){
    this.message = message;
    this.color = color;
    this.time = time;
    this.element = null;
    var element = document.createElement('div');
    element.className = "toast-notification";
    this.element = element;
    var countElements = document.getElementsByClassName("toast-notification");
    
    element.style.opacity=0.8;
    
    element.style.marginBottom = (countElements.length * 55) + "px";
    
    element.style.backgroundColor = this.color;
    
    var message = document.createElement("div");
    message.className = "message-container";
    message.textContent = this.message;
    
    element.appendChild(message);
    
    var close = document.createElement("div");
    close.className = "close-notification";
    
    var icon = document.createElement("i");
    icon.className = "lni lni-close";
    
    
    
    
    close.appendChild(icon);
    
    
    element.append(close);
    
    document.body.appendChild(element);
    
    setTimeout(function() {
    element.remove();
    }, this.time);
    
    close.addEventListener("click",()=>{
    element.remove();
    })
}

}

const ToastType = {
Danger : "#eb3b5a",
Warning: "#fdcb6e",
Succes : "#00b894",
}
  

new Toast("Loading... ",ToastType.Succes,3000);

var heros = document.getElementById("heros");
var search = document.getElementById("search");
var submit = document.getElementById("submit");
var body = document.getElementById("body");
var bookmarked_heros = document.getElementById("bookmarked_heros");
var statuss = 0; // 0 - normal , 1 - search, 2 - bookmark

var ts = CryptoJS.MD5(Date.now().toString());
var publicKey = "4e5eab3e766f2717bd00c5721f841689";
var privateKey = "63e6e43c0eb00694b0782ca23fe3f5315374fcbe";
var hash = CryptoJS.MD5(ts + privateKey + publicKey);
var load = true;

var offset = 100;
var limit = 100;

(async () => {
    statuss = 1;
    var charactersApi = "https://gateway.marvel.com:443/v1/public/characters?limit=100&offset=0&ts="+ts+"&apikey="+publicKey+"&hash="+hash;
    var res2 = await fetch(charactersApi).then(response => response.json());

    var data2 = res2.data.results;
    for( var d of data2) {
        var url = d.urls;
        var thumbnail = d.thumbnail;
        var img = thumbnail.path + '.' + thumbnail.extension;
        if(img.includes("image_not_available") || img.includes("4c002e0305708")){
            continue;
        }
        var title = d.name;
        heros.innerHTML += getHtml(img, title, d.id, url[0].url);
    }

})();

submit.onclick = async function(e){
    statuss = 2;
    e.preventDefault();
    heros.innerHTML = "";
    var name = search.value;
    var namewise = "https://gateway.marvel.com:443/v1/public/characters?nameStartsWith="+name+"&ts="+ts+"&apikey="+publicKey+"&hash="+hash;
    var res3 = await fetch(namewise).then(response => response.json());
    var data3 = res3.data.results;

    offset = 0;
    if(data3.length === 0) {
        heros.innerHTML += "<h3>Not Found!! Please try different name</h3>";
    } 
    else{
        new Toast("Loading... ",ToastType.Succes,3000);
        for( var d of data3) {
            var url = d.urls;
            var thumbnail = d.thumbnail;
            var img = thumbnail.path + '.' + thumbnail.extension;
            if(img.includes("image_not_available") || img.includes("4c002e0305708")){
                continue;
            }
            var title = d.name;

            heros.innerHTML += getHtml(img, title, d.id, url[0].url);
        }
    }
}

bookmarked_heros.onclick = async function(){
    statuss = 3;
    var array = JSON.parse(localStorage.getItem("bookmarked_hero"));

    heros.innerHTML = "";
    if(array.length == 0){
        heros.innerHTML += "<h3>No Bookmarked heros!!</h3>";
        return;
    }
    new Toast("Loading... ",ToastType.Succes,1000);
    for( var id of array) {
        var charactersApi = "https://gateway.marvel.com:443/v1/public/characters/"+id+"?"+ts+"&apikey="+publicKey+"&hash="+hash;
        var res2 = await fetch(charactersApi).then(response => response.json());
        var data2 = res2.data.results;
        var d = data2[0];
        var url = d.urls;
        var thumbnail = d.thumbnail;
        var img = thumbnail.path + '.' + thumbnail.extension;
        if(img.includes("image_not_available") || img.includes("4c002e0305708")){
            continue;
        }
        var title = d.name;
        heros.innerHTML += '<div class="card details" style="width: 20rem; padding:10px">' + 
            '<img class="card-img-top" src="'+img+'" alt="Card image cap"> '+
            '<div class="card-body"> '+
            '<h5 class="card-title">'+title+'</h5> '+
            '</div> '+
            '<ul class="list-group list-group-flush">'+
            '<li class="list-group-item" name="remove_bookmark" id="'+d.id+'">Remove Bookmark!</li>'+
            '<li class="list-group-item"><a href='+url[0].url+' target="_blank" >Know More</a></li>'+
            '</ul>'+
        '</div>';
    }
}

document.onscroll = async function() {
    if(!load)
        return ;
    
    if(statuss != 1)
        return;

    if(document.documentElement.scrollTop > document.documentElement.scrollHeight - 2000)
    {
        new Toast("Loading... ",ToastType.Succes,3000);
        load = false;
        var charactersApi = "https://gateway.marvel.com:443/v1/public/characters?limit="+limit+"&offset="+offset+"&ts="+ts+"&apikey="+publicKey+"&hash="+hash;
        var res2 = await fetch(charactersApi).then(response => response.json());

        var data2 = res2.data.results;
        for( var d of data2) {
            var url = d.urls;
            var thumbnail = d.thumbnail;
            var img = thumbnail.path + '.' + thumbnail.extension;
            if(img.includes("image_not_available") || img.includes("4c002e0305708")){
                continue;
            }
            var title = d.name;
            heros.innerHTML += getHtml(img, title, d.id, url[0].url);
            load = true;
        }
        offset += 100;
    }
}


heros.addEventListener("click",function(e) {
    var target = e.target
    if (target.getAttribute("name") === "bookmark"){
        new Toast("Bookmarked... ",ToastType.Succes,3000);
        var id = target.getAttribute("id");
        var array = [];
        if(localStorage.getItem('bookmarked_hero') === null) {
            array = [];
        }
        else{
            array = JSON.parse(localStorage.getItem("bookmarked_hero"));
        }
        array.push(id);
        localStorage.setItem("bookmarked_hero", JSON.stringify(array))
    }
    if (target.getAttribute("name") === "remove_bookmark"){
        new Toast("Removing.. ",ToastType.Succes,1000);
        var id = target.getAttribute("id");
        
        var array = JSON.parse(localStorage.getItem("bookmarked_hero"));
        removeElement(array, id);
        localStorage.setItem("bookmarked_hero", JSON.stringify(array))
        bookmarked_heros.click();
    }
});



function getHtml(img, title, id, url) {
    return '<div class="card details" style="width: 20rem; padding:10px">' + 
        '<img class="card-img-top" src="'+img+'" alt="Card image cap"> '+
        '<div class="card-body"> '+
        '<h5 class="card-title">'+title+'</h5> '+
        '</div> '+
        '<ul class="list-group list-group-flush">'+
        '<li class="list-group-item" name="bookmark" id="'+id+'">Bookmark!</li>'+
        '<li class="list-group-item"><a href='+url+' target="_blank" >Know More</a></li>'+
        '</ul>'+
    '</div>';
}

const removeElement = (arr, element) => {
    if(arr.indexOf(element) !== -1){
        arr.splice(arr.indexOf(element), 1);
        return ;
    };
};
