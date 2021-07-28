import { isTouch, eventsName } from '../Utils/Base';
import CoordTransform from '../Utils/CoordTransform';
import Stroke from '../Utils/Stroke';
import { CalcTextAreaRect, CalcTextRect } from '../Utils/MeasureText';
import CloneCanvas from '../Utils/CloneCanvas';
import Fill from '../Utils/Fill';

const Text = (() => {
    let inputDom = null;
    let canvas = null;
    let ctx = null;
    let textStartPos = null;
    let cloneCanvas = null;
    let textData = null;
    let fontSize = 30;
    let fontFamily = 'sans-serif';
    let fillStyle = '#000000';
    let selectStyle = '#9bf56e';
    let textBoxWidth = 100;
    let textBoxHeight = 20;
    let editing = false;
    let _timer = null;
    let editLineIndex = 0;
    let editCharIndex = 0;
    let cursorShowing = true;
    let textArea = document.createElement('textarea');
    let that = null;

    const FormatStr = (str) => {
        let data = {
            width : 0,
            height : 0,
            lines : []
        };

        data.lines = str.split('\n')
                        .map(line => {
                            let lineData = {
                                width : 0,
                                height : 0,
                                chars : []
                            };

                            line.split('')
                                .map(char => {
                                    if(char === ' '){
                                        char = '&nbsp;';
                                    }
                                    let r = CalcTextRect(char, fontSize, fontFamily);

                                    lineData.chars.push({
                                        char,
                                        width : r.width,
                                        height : r.height
                                    });
                                    // lines
                                    lineData.width += r.width;
                                    lineData.height = Math.max(lineData.height, r.height);
                                });

                            // blocks
                            data.width = Math.max(data.width, lineData.width);
                            data.height += lineData.height;

                            return lineData;
                        });

        return data;
    };

    const GetCursorPos = ({ x, y } = {}) => {
        let { lines, width, height } = textData;
        let result = {
            x : 0,
            y : 0
        };

        // no input parameters
        if(!x){
            result.y = lines.length - 1;

            if(lines.length > 0){
                result.y = lines[0].chars.length;
            } else{
                result.y = 0;
            }
        } else{
            let offsetX = x - textStartPos.x;
            let offsetY = y - textStartPos.y;

            if(
                offsetX > 0 && offsetX < width &&
                offsetY > 0 && offsetY < height
            ){
                // inside of text area
                let currX = 0;
                let currY = 0;

                // console.log('inside of text area');
                for(let i = 0; i < lines.length; i++){
                    let line = lines[i];

                    currX = 0;
                    currY += line.height;

                    // determine line
                    if(offsetY < currY){
                        result.y = i;

                        for(let k = 0; k < line.chars.length; k++){
                            let char = line.chars[k];
                            let centerOfChar = currX + char.width / 2;

                            // console.log(k, offsetY, centerOfChar);
                            if(offsetX < centerOfChar){
                                result.x = k;
                                break;
                            } else if(offsetX > centerOfChar && offsetX < currX + char.width){
                                // console.log('right');
                                result.x = k + 1;
                                break;
                            } else if(offsetX > currX + line.width){
                                result.x = line.chars.length;
                                break;
                            }

                            currX += char.width;
                        }

                        break;
                    }

                }
            } else{
                // outside of text area
                return false;
            }
        }

        // console.log(result);

        return result;
    };

    const Render = () => {
        // render basic
        that.CleanBoard();
        ctx.drawImage(cloneCanvas, 0, 0);

        if(textData.length === 0){
            return;
        }

        ctx.save();

        // render box
        let { x, y } = textStartPos;
        let _m = 2;
        let _w = textBoxWidth + _m;
        let _h = textBoxHeight + _m;
        let radius = 3;

        x -= 1;
        y -= 1;

        ctx.beginPath();
        ctx.moveTo(x, y + radius);
        ctx.lineTo(x, y + _h - radius);
        ctx.arcTo(x, y + _h, x + radius, y + _h, radius);
        ctx.lineTo(x + _w - radius, y + _h);
        ctx.arcTo(x + _w, y + _h, x + _w, y + _h - radius, radius);
        ctx.lineTo(x + _w, y + radius);
        ctx.arcTo(x + _w, y, x + _w - radius, y, radius);
        ctx.lineTo(x + radius, y);
        ctx.arcTo(x, y, x, y + radius, radius);
        ctx.stroke();

        // cursors
        let cursorX = 0;
        let cursorY = 0;
        let cursorHeight = 0;

        // render text
        let lines = textData.lines;
        let currX = textStartPos.x;
        let currY = textStartPos.y;

        ctx.fillStyle = fillStyle;
        ctx.font = fontSize + 'px ' + fontFamily;
        ctx.textBaseline = 'middle';
        lines.map((line, lineIndex) => {
            let chars = line.chars;

            chars.map((char, charIndex) => {
                // render char's bg
                if(!char.selected){
                    Fill({
                        type : 'rect',
                        ctx,
                        fillStyle : selectStyle,
                        param : {
                            x : currX,
                            y : currY,
                            // render one pixel more
                            // repair joint between two char bg block
                            w : char.width + 1,
                            h : line.height + 1
                        }
                    });
                }

                // render char
                // render at the vertical center of the block
                // avoid different language char's rendering offset
                ctx.fillText(char.char, currX, currY + line.height / 2 + 0);

                currX += char.width;

                // get cursor position and height
                if(editLineIndex === lineIndex){
                    cursorY = currY;
                    cursorHeight = line.height;

                    // if last one
                    if(charIndex + 1 === chars.length){
                        cursorX = currX;
                    } else if(editCharIndex === charIndex){
                        cursorX = currX - char.width;
                    }
                }
            });

            currX = textStartPos.x;
            currY += line.height;
        });

        // render cursor
        if(editing && cursorShowing){
            ctx.beginPath();
            ctx.moveTo(cursorX, cursorY);
            ctx.lineTo(cursorX, cursorY + cursorHeight);
            ctx.stroke();
        }

        ctx.restore();
    };

    const Start = function(){
        that = this;
        ctx = this.ctx;
        canvas = this.canvas;
        inputDom = document.createElement('input');
        fontSize = this.fontSize || fontSize;
        fontFamily = this.fontFamily || fontFamily;
        fillStyle = this.textColor || fillStyle;
        selectStyle = this.selectStyle || selectStyle;
        textData = null;
        editing = false;

        /* const disabledSelection = (event) => {
         event.preventDefault();
         };*/
        /*
         let lastCoord = null;

         const move = (event) => {
         let { strokeWidth, strokeColor } = this.strokeConfig;
         let x = isTouch ? event.touches[0].pageX : event.x;
         let y = isTouch ? event.touches[0].pageY : event.y;

         let currCoord = CoordTransform({
         canvas,
         event : {
         x,
         y
         }
         });

         this.Operating();

         Stroke({
         start : lastCoord,
         end : currCoord,
         ctx,
         strokeWidth,
         strokeColor
         });

         lastCoord = currCoord;
         event.preventDefault();
         };

         const up = () => {
         this.OperatingEnd();
         document.removeEventListener(eventsName[1], move);
         document.removeEventListener('selectstart', disabledSelection);
         document.removeEventListener(eventsName[2], up);
         };
         */

        canvas['on' + eventsName[0]] = (event) => {
            let x = isTouch ? event.touches[0].pageX : event.x;
            let y = isTouch ? event.touches[0].pageY : event.y;
            let coord = CoordTransform({
                canvas,
                event : {
                    x : Math.round(x),
                    y : Math.round(y)
                }
            });
            this.OperatingStart();

            if(editing){
                // check click position
                let r = GetCursorPos(coord);
                console.log(r);
                editCharIndex = r.x;
                editLineIndex = r.y;
                cursorShowing = true;
                Render();
            } else{
                cloneCanvas = CloneCanvas(this.canvas);
                textStartPos = coord;

                // let charStr = '给我一个理由忘记\n当时做的决定,有些\n你当我\nhello,world!';
                let charStr = '你好\nHi\nCiao\nسلام\nBonjour\nनमस्ते\n안녕하세요\nこんにちは';
                // let charStr = '文本';

                // test data
                textData = FormatStr(charStr);
                textBoxWidth = textData.width;
                textBoxHeight = textData.height;
                GetCursorPos();
                Render();

                // start editing
                editing = true;

                _timer = setInterval(() => {
                    cursorShowing = !cursorShowing;
                    Render();
                }, 500);
            }

            // document.addEventListener(eventsName[1], move, { passive : false });
            // document.addEventListener('selectstart', disabledSelection);
            // document.addEventListener(eventsName[2], up);
        };
    };

    const Quit = function(){
        canvas['on' + eventsName[0]] = null;
        editing = false;
        _timer && clearInterval(_timer);
    };

    return {
        Start,
        Quit
    };
})();

export default Text;