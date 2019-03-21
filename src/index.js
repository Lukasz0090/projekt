require('./setup.js');
const formFormats = document.querySelector(".forms-content form");
const changeBackgroundInput = document.querySelector('#radio-button');
// const changeBackgroundThisBanner = document.querySelector('#custom-setting-background');
const clearButton = document.querySelector('#clearSet');
const generateButton = document.querySelector('#generateData');
let globalSettingRadioButton = "contain";
let formatsArrSmall = [], size = 10;
updateValueInput();


// Form add formats banner and set video
formFormats.addEventListener('submit', (ev) => {
    let loader = document.querySelector('section.loader');
    ev.preventDefault();
    formatsArrSmall = [];
    let errorMessage = document.querySelector('p#error');
    clearHTML();
    // show loader
    loader.style.display = "block";
    const fileUrl = localFileVideoPlayer();
    if (fileUrl) {
        errorMessage.innerHTML = '&nbsp;';
        const formats = document.getElementById('getFormats').value;
        // Dodać tablice 
        const xhr = new XMLHttpRequest();
        xhr.onreadystatechange = function () {
            if (xhr.readyState == 4 && xhr.status == 200) {
                obj = JSON.parse(this.responseText);
                // number of banners to generate
                let lenBanners = obj.data.filter(element => Object.keys(element) == formats)[0][formats].length;
                document.querySelector("input#generateData").setAttribute('number-banners', lenBanners);

                createFormats(obj.data.filter(element => Object.keys(element) == formats)[0][formats], fileUrl);
                update();
                window.onscroll = function () {
                    update();
                    yHandler(fileUrl);
                };
                restoreActionInput();
                // hidden loader
                loader.style.display = "none";
            }
        };
        xhr.open("GET", "./static/banners.json", true);
        xhr.send();
    } else {
        errorMessage.innerHTML = 'File format not supported';
    }
}, false);

// create div with video
function createElement(element, index, dynamicContent = null) {
    const widthElement = element.width;
    const heightElement = element.height;
    let newElement = document.createElement('div');
    const styleElement = `style="width:${widthElement}px; height:${heightElement}px;"`;
    let paragraph = `<p>${element.dimension}</p>`;
    let checkbox = `<label for="${element.name}_${index}" class="container" title="Unchecking the box will skip this banner during settings generation"> <input id="${element.name}_${index}" type="checkbox" checked="checked" title="Unchecking the box will skip this banner during settings generation"> <span class="custom-control-label"></span></label>`;
    let divChild =
        (`<div ${styleElement} class="element-content">
            <div style="width:100%; height:100%;" data-name="${element.name}">
                <video id="movie_${index}" style="width:100%; height:100%;" loop="loop" muted="muted" background-size="contain">
                    <source src="" type="video/mp4">
                </video>
            </div>
        </div>`);
    let moreDiv = '<span class="more-info fa fa-gear" style="font-size:22px;" title="Custom settings this banner"></span>';
    let moreContent = createMoreInfoContent();
    newElement.className = (dynamicContent) ? ('wrapp-content new') : ('wrapp-content');
    newElement.innerHTML = paragraph + divChild + checkbox + moreDiv + moreContent;
    return document.body.querySelector(`main section.fill-content`).appendChild(newElement);
}

function clearHTML() {
    document.body.querySelector(`main section.fill-content`).innerHTML = '';
}

function localFileVideoPlayer() {
    const URL = window.URL || window.webkitURL;
    const file = document.getElementById('move').files[0];
    const type = file.type
    return (type.match(/video\/.*/g)) ? URL.createObjectURL(file) : false;
}

//  global checkbox  cover and contain 

changeBackgroundInput.addEventListener('change', (ev) => {
    ev.preventDefault();
    const id = ev.target.id;
    globalSettingRadioButton = id;
    const allDivsFormat = document.querySelectorAll('.fill-content .wrapp-content');

    allDivsFormat.forEach(function (element) {
        if (!element.classList.contains('custom-setting-active')) {
            const sizeBanner = element.children[0].innerHTML;
            const widthBanner = sizeBanner.split("x")[0];
            const heigthBanner = sizeBanner.split("x")[1];
            const el = element.children[1].children[0];
            const video = element.children[1].children[0].children[0];
            video.setAttribute('background-size', (id == 'cover') ? 'cover' : 'contain');
            el.style.cssText = (id == 'cover') ? setCoverToBanner(widthBanner, heigthBanner, video) : "height: 100%; width: 100%;margin-top:0px;margin-left:0px;";
        }
    });

}, false);


//  Cover setting for banner

function setCoverToBanner(widthBanner, heigthBanner, video) {
    let widthContener = 0;
    let heightContener = 0;
    let marginTop = 0;
    let marginLeft = 0;
    if (parseFloat(widthBanner) >= parseFloat(heigthBanner)) {
        //szeroki
        video.style.cssText = `width: ${widthBanner}px;`;
        if (heigthBanner > video.clientHeight) {
            video.style.cssText = `height: ${heigthBanner}px;`;
            heightContener = heigthBanner;
            widthContener = video.clientWidth;
            marginLeft = -((widthContener - widthBanner) / 2);
        } else {
            heightContener = video.clientHeight;
            marginTop = - ((heightContener - heigthBanner) / 2);
            widthContener = widthBanner;
        }
    } else {
        // wąski
        video.style.cssText = `height: ${heigthBanner}px;`;
        if (widthBanner > video.clientWidth) {
            video.style.cssText = `width: ${widthBanner}px;`;
            heightContener = video.clientHeight;
            marginTop = - ((heightContener - heigthBanner) / 2);
            widthContener = widthBanner;
        } else {
            widthContener = video.clientWidth;
            heightContener = heigthBanner;
            marginLeft = -((widthContener - widthBanner) / 2);
        }
    }
    video.style.cssText = `width: 100%; height:100%;`;
    return `width:${widthContener}px; margin-left:${marginLeft}px; height: ${heightContener}px; margin-top:${marginTop}px;`;
}

// clear global setting button

clearButton.addEventListener('click', (ev) => {
    ev.preventDefault();
    const allDivsFormat = document.querySelectorAll('.fill-content .wrapp-content');
    if (document.querySelector(".custom-setting-active")) document.querySelector(".custom-setting-active").classList.remove("custom-setting-active");
    if (document.querySelector(".custom-setting-content.active")) document.querySelector(".custom-setting-content.active").classList.remove("active");
    if (document.querySelector(".clicked")) document.querySelector(".clicked").classList.remove("clicked")
    if (document.querySelector(".fa-close")) document.querySelector(".fa-close").classList.add("fa-gear");
    if (document.querySelector(".fa-close")) document.querySelector(".fa-close")/*.classList.remove("fa-close")*/;
    allDivsFormat.forEach(function (element) {
        restoreOriginalBannerSettings(element);
    });
    restoreActionInput();
}, false);

function restoreOriginalBannerSettings(element) {
    const parentvideo = element.children[1].children[0];
    parentvideo.style.cssText = "height: 100%; width: 100%;margin-top:0px;margin-left:0px;";
    parentvideo.children[0].setAttribute('background-size', 'contain');
    return element.children[2].children[0].checked = true;
}


function restoreActionInput(customSet = null) {
    const idsInput = (customSet) ? ['vertical-set', 'horizontal-set', 'contain-this-banner', 'cover-this-banner'/*'saveCustomSetting'*/] : ['contain', 'cover', 'generateData', 'clearSet'];
    idsInput.forEach(function (element) {
        document.getElementById(element).disabled = false;
        if (element == 'contain') document.getElementById(element).checked = true;
    });
}

function blockActionInputsCustom() {
    const idsInput = ['vertical-set', 'horizontal-set', 'contain-this-banner', 'cover-this-banner'];
    idsInput.forEach(function (element) {
        document.getElementById(element).disabled = true;
        document.getElementById(element).value = null;
        if (element == 'contain-this-banner' || element == 'cover-this-banner') document.getElementById(element).checked = false;
    });
}

// get css from selected banner to inputs
function getCustomValue() {
    const div = document.querySelector('.custom-setting-active').children[1].children[0];
    const marginTop = window.getComputedStyle(div).getPropertyValue('margin-top');
    const marginLeft = window.getComputedStyle(div).getPropertyValue('margin-left');
    return [parseFloat(marginTop), parseFloat(marginLeft)];
}




// generating and returning data

generateButton.addEventListener('click', (ev) => {
    ev.preventDefault();
    const allDivsFormat = document.querySelectorAll('.fill-content .wrapp-content');
    let numberBanners = ev.target.getAttribute('number-banners');
    if (allDivsFormat.length == numberBanners) {
        let settings = [];
        allDivsFormat.forEach(function (element) {
            if (element.children[2].children[0].checked) {
                let bannerId = element.children[1].children[0].getAttribute('data-name');

                let typ = document.getElementById('getFormats').value;
                let value = window.getComputedStyle(element.children[1].children[0]);
                let setting = { 'id': bannerId, 'typ': typ, 'vertical': value.getPropertyValue('margin-top'), 'horizontal': value.getPropertyValue('margin-left') };
                settings.push(setting);
            }
        });
        if (settings.length !== 0) {
            document.getElementById("json").innerHTML = JSON.stringify(settings, undefined, 2); //dodać generowanie jsona 
            document.querySelector('#popup').style.opacity = 1;
            document.querySelector('#popup').style.visibility = 'visible';
        } else {
            false
        }
    } else {
        alertBox('err', 'Please scroll down in the main window in order to generate preview for all banners.');
    }


}, false);

//button close popup
document.querySelector('span#close').addEventListener('click', (ev) => {
    document.querySelector('#popup').style.opacity = 0;
    document.querySelector('#popup').style.visibility = 'hidden';
}, false);

function updateValueInput() {
    const xhr = new XMLHttpRequest();
    xhr.onreadystatechange = function () {
        if (xhr.readyState == 4 && xhr.status == 200) {
            obj = JSON.parse(this.responseText);
            obj = obj.data;
            for (let i = 0; i < obj.length; i++) {
                let option = document.createElement("option");
                option.text = `${Object.keys(obj[i])[0]}`;
                option.value = `${Object.keys(obj[i])[0]}`;
                const select = document.getElementById("getFormats");
                select.appendChild(option);
            }
        }
    };
    xhr.open("GET", "./static/banners.json", true);
    xhr.send();
}

function createFormats(formatsArr, fileUrl) {

    while (formatsArr.length > 0) {
        formatsArrSmall.push(formatsArr.splice(0, size));
    }
    formatsArrSmall[0].forEach(function (element, index) {
        addActionToCreatedElement(element, index, fileUrl);
    });
    formatsArrSmall = formatsArrSmall.slice(1);
}

function yHandler(fileUrl) {
    let wrap = document.querySelector('.fill-content');
    let contentHeight = wrap.offsetHeight; //Gets page content height
    let yOffset = window.pageYOffset; //Gets th vertical scroll
    let y = yOffset + window.innerHeight;
    if (y >= contentHeight) {
        if (formatsArrSmall.length > 0) {
            formatsArrSmall[0].forEach(function (element, index) {
                index = Math.random().toString(36).substr(2, 9) + '_' + (parseFloat(index) * (Math.floor(Math.random() * 50) + 1));
                addActionToCreatedElement(element, index, fileUrl, 1);
            });
            formatsArrSmall = formatsArrSmall.slice(1); // delete first element array
        }
    }
}

function addActionToCreatedElement(element, index, fileUrl, checkCreatedItem = null) {
    const el = (checkCreatedItem) ? createElement(element, index, true) : createElement(element, index);
    if (el) {
        // add video to element
        const videoNode = document.getElementById(`movie_${index}`);
        videoNode.src = fileUrl;

        // add click with more info
        const moreInfo = el.children[3];

        moreInfo.addEventListener('click', (ev) => {
            ev.preventDefault();
            if (!ev.currentTarget.classList.contains('clicked')) {
                if (document.querySelector(".custom-setting-active")) document.querySelector(".custom-setting-active").classList.remove("custom-setting-active");
                if (document.querySelector(".clicked")) document.querySelector(".clicked").classList.remove("clicked");
                if (document.querySelector(".fa-close")) document.querySelector(".fa-close").classList.remove("fa-close");
                document.querySelectorAll(".more-info").forEach((el) => {
                    if (!el.classList.contains("fa-gear")) el.classList.add("fa-gear");
                    // remove class active from all bubble with banner custom setting  
                    if (el.parentElement.children[4].classList.contains("active")) el.parentElement.children[4].classList.remove("active");
                });
                const parrentDiv = ev.srcElement.parentElement;
                parrentDiv.classList.add("custom-setting-active");
                // show moreInfo content
                elementTopValue = parseFloat(parrentDiv.offsetHeight) + 35;
                const customValue = getCustomValue();
                const valueRadioCustom = ev.target.parentElement.children[1].children[0].children[0].getAttribute("background-size");
                setValueThisBanner(customValue[1], customValue[0], `${valueRadioCustom}-this-banner`, parrentDiv.children[4], elementTopValue);
                ev.currentTarget.classList.add('clicked');
                ev.currentTarget.classList.remove('fa-gear');
                ev.currentTarget.classList.add("fa-close");
            } else {
                ev.currentTarget.classList.remove('clicked');
                if (ev.target.parentElement.classList.contains("custom-setting-active")) ev.target.parentElement.classList.remove("custom-setting-active");
                ev.currentTarget.classList.remove('fa-close');
                ev.currentTarget.classList.add("fa-gear");
                // remove class active from bubble with banner custom setting  
                ev.target.parentElement.children[4].classList.remove("active");
            }
        }, false);
        return el;
    }
}

function setValueThisBanner(horizontal, vertical, radiobutton, parent, topPosition) {
    const form = parent.children[1];
    const formInputs = parent.children[2];
    let inputVertical = formInputs.children[1];
    let inputHorizontal = formInputs.children[3];

    // add class 
    const divDraggable = parent.parentElement.children[1].children[0];
    if (document.querySelector(".draggable-active")) document.querySelector(".draggable-active").classList.remove("draggable-active");
    divDraggable.classList.add("draggable-active");


    // set value in inputs
    inputHorizontal.value = horizontal;
    inputVertical.value = vertical;
    // checked radio button with custom set banner
    form.getElementsByClassName(radiobutton)[0].checked = true;
    parent.style.top = `${topPosition}px`;
    parent.classList.add("active");

    // checkbox cover and conatain this banner
    form.addEventListener('change', (ev) => {
        ev.preventDefault();
        const classArr = ev.target.className.split(" ");
        const id = (classArr.indexOf("cover-this-banner") > -1) ? 'cover' : 'contain';
        const element = document.querySelector('.fill-content .custom-setting-active');
        const sizeBanner = element.children[0].innerHTML;
        const widthBanner = sizeBanner.split("x")[0];
        const heigthBanner = sizeBanner.split("x")[1];

        const el = element.children[1].children[0];
        const video = element.children[1].children[0].children[0];
        video.setAttribute('background-size', (id == 'cover') ? 'cover' : 'contain');
        el.style.cssText = (id == 'cover') ? setCoverToBanner(widthBanner, heigthBanner, video) : "height: 100%; width: 100%;margin-top:0px;margin-left:0px;";
        if (element.classList.contains('custom-setting-active')) {
            const div = element.children[1].children[0];

            const marginTop = window.getComputedStyle(div).getPropertyValue('margin-top');
            const marginLeft = window.getComputedStyle(div).getPropertyValue('margin-left');
            inputVertical.value = (marginTop) ? parseFloat(marginTop) : null;
            inputHorizontal.value = (marginLeft) ? parseFloat(marginLeft) : null;
        }
    }, false);


    // change settings in the selected banner

    formInputs.addEventListener('change', (ev) => {
        ev.preventDefault();
        const value = ev.target.value;
        const div = document.querySelector('.custom-setting-active').children[1].children[0];
        if (ev.target.className == 'vertical-set') {
            //pion
            div.style.marginTop = `${value}px`;
        } else {
            // poziom
            div.style.marginLeft = `${value}px`;
        }
    }, false);


    // clear setting in this banner

    const inputClearSetting = parent.children[3];
    inputClearSetting.addEventListener('click', (ev) => {
        const divWrap = ev.target.parentElement.parentElement;
        if (restoreOriginalBannerSettings(divWrap)) {
            ev.target.parentElement.children[1].children[0].children[0].checked = true;
            ev.target.parentElement.children[2].children[1].value = null;
            ev.target.parentElement.children[2].children[3].value = null;
        }
    }, false);


    // draggable div with video
    let offset = [0, 0];
    draggableElement(document.querySelector(".wrapp-content.custom-setting-active div div.draggable-active"), offset);
}

function draggableElement(divDraggable, offset) {
    let isDown = false;
    divDraggable.addEventListener('mousedown', function (e) {
        isDown = true;
        offset = [
            divDraggable.offsetLeft - e.clientX,
            divDraggable.offsetTop - e.clientY
        ];
    }, true);

    document.addEventListener('mouseup', function () {
        isDown = false;
    }, true);

    document.addEventListener('mousemove', function (e) {
        event.preventDefault();
        if (isDown) {
            divDraggable.style.marginLeft = (e.clientX + offset[0]) + 'px';
            divDraggable.style.marginTop = (e.clientY + offset[1]) + 'px';
        }
    }, true);
}


function pauseVideo(video) {
    video.pause();
    if (video.classList.contains("widoczny"))
        video.classList.remove("widoczny");
    video.classList.add("nie-widoczny")
}
function playVideo(video) {
    video.play();
    if (video.classList.contains("nie-widoczny"))
        video.classList.remove("nie-widoczny");
    video.classList.add("widoczny")
}

// scroling and check element is visible

function checkVisible(elm) {
    var rect = elm.getBoundingClientRect();
    var viewHeight = Math.max(document.documentElement.clientHeight, window.innerHeight);
    return !(rect.bottom < 0 || rect.top - viewHeight >= 0);
}


function update() {
    var divs = document.querySelectorAll('.wrapp-content');
    divs.forEach(function (element) {
        const video = element.children[1].children[0].children[0];
        checkVisible(element) ? playVideo(video) : pauseVideo(video);
    });
};

const copyJsonBtn = document.querySelector('#copyJsonBtn');

copyJsonBtn.addEventListener('click', function (event) {
    const copyTextarea = document.querySelector('#json');
    copyTextarea.focus();
    copyTextarea.select();
    try {
        let successful = document.execCommand('copy');
        if (successful) {
            alertBox('success', 'Copying text command was successful');
        } else {
            alertBox('err', 'Copying text command was unsuccessful');
        }

    } catch (err) {
        console.log('Oops, unable to copy');
    }
});

function alertBox(type, text) {
    const err = document.querySelector(".error-alert");
    const success = document.querySelector(".success-alert");
    const alert = document.querySelector(".alert");
    if (err) {
        err.classList.remove("error-alert");
    } else if (success) {
        success.classList.remove("success-alert");
    }
    alert.children[1].innerHTML = '';
    alert.children[1].innerHTML = text;
    (type == 'err') ? alert.classList.add("error-alert") : alert.classList.add("success-alert");
    alert.style.display = 'block';
}


function createMoreInfoContent() {
    const content = (`<section class="custom-setting-content">
        <p>Custom settings banner</p>
        <form class="custom-setting-background">
            <label class="container">
                <input type="radio" name="radio" class="custom-control-input background-this-banner contain-this-banner">
                <span class="custom-control-label">Contain</span>
            </label>
            <label class="container">
                <input  type="radio" name="radio" class="custom-control-input background-this-banner cover-this-banner">
                <span class="custom-control-label">Cover</span>
            </label>
        </form>
        <form class="custom-setting-form">
            <label>Vertical</label>
                <input class="vertical-set" type="number" value="" size="40" placeholder="0">
                <label>Horizontal</label>
            <input class="horizontal-set" type="number" value="" size="40" placeholder="0" >
        </form>
        <input type="button" value="Clear setting" class="button-content">
      </section>`);
    return content;
}

function elo() {
    if (globalSettingRadioButton == 'cover') {
        const sizeBanner = divWrapp.children[0].innerHTML;
        const widthBanner = sizeBanner.split("x")[0];
        const heigthBanner = sizeBanner.split("x")[1];
        const el = divWrapp.children[1].children[0];
        const video = divWrapp.children[1].children[0].children[0];
        video.setAttribute('background-size', 'cover');
        el.style.cssText = setCoverToBanner(widthBanner, heigthBanner, video);
    } else {
        const video = divWrapp.children[1].children[0].children[0];
        video.setAttribute('background-size', 'contain');
    }
    divWrapp.classList.remove("new");
}