import aealk from '../dist/bundle/client';

const {
    initIsSu,
    getKeyLevel,
    checkAndInputKey,
    getKeyFromCookie,
    getFile,
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
    console.log(await getFile('test2/Test2.html', 'testKey1'))
}
function btn3_click() { }

window.btn1_click = btn1_click;
window.btn2_click = btn2_click;
window.btn3_click = btn3_click;