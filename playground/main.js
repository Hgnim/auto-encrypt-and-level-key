import aealk from '../dist/bundle/client';

const {
    initIsSu,
    getKeyLevel,
    checkAndInputKey,
    getKeyFromCookie,
    getUint8ArrayFromFile,
    getStringFromFile,
    getBlobFromFile,
} = await aealk({
    rootPath: '/aealk',
});

/*console.log(aealk({
    rootPath: '/aealk',
}));*/

function btn1_click() {
    console.log(initIsSu);
    console.log(checkAndInputKey('testKey0'));
    console.log(getKeyLevel('test0'));
    console.log(getKeyLevel('testKey0'));
}
async function btn2_click() { 
    console.log(await getStringFromFile('test2/Test2.html', 'testKey1'))
}
async function btn3_click() { 
    //console.log(checkAndInputKey('testKey2'));
    console.log(await getStringFromFile('test1.html', 'testKey2'))
    console.log(await getStringFromFile('test1.html', 'testKey1'))
    console.log(await getStringFromFile('test2/Test2.html', 'testKey2'))
}
async function btn4_click() {
    console.log(await getStringFromFile('test1.html'));
    console.log(await getUint8ArrayFromFile('test1.html'));
    console.log(await getBlobFromFile('test1.html'));
}

window.btn1_click = btn1_click;
window.btn2_click = btn2_click;
window.btn3_click = btn3_click;
window.btn4_click = btn4_click;