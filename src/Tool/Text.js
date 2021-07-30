import { isTouch, eventsName } from '../Utils/Base';
import CoordTransform from '../Utils/CoordTransform';
import Stroke from '../Utils/Stroke';
import { CalcTextAreaRect, CalcTextRect } from '../Utils/MeasureText';
import CloneCanvas from '../Utils/CloneCanvas';
import Fill from '../Utils/Fill';

const Text = (() => {
    let canvas = null;
    let ctx = null;
    // init position
    let textStartPos = null;
    let cloneCanvas = null;
    // data
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
    let rangeLength = 0;
    const disabledSelection = (event) => {
        event.preventDefault();
    };

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

    const GetCursorPos = ({ x, y, freeMode = false } = {}) => {
        let { lines, width, height } = textData;
        let result = {
            x : 0,
            y : 0
        };
        let offsetY = y - textStartPos.y;
        let offsetX = x - textStartPos.x;

        const GetLine = () => {
            let r = {
                outer : false,
                i : 0
            };
            let currY = 0;

            if(offsetY < 0){
                r.outer = true;

            } else if(offsetY > height){
                r.outer = true;
                r.i = lines.length - 1;
            } else{
                // if( offsetY > 0 && offsetY < height){}
                // console.log('inside of text area');
                for(let i = 0; i < lines.length; i++){
                    let line = lines[i];

                    currY += line.height;

                    // determine line
                    if(offsetY < currY){
                        r.i = i;
                        break;
                    }
                }
            }

            return r;
        };

        const GetChar = (line) => {
            let r = {
                outer : false,
                i : 0
            };
            let currX = 0;

            if(offsetX < 0){
                r.outer = true;
            } else if(offsetX > width){
                r.i = line.chars.length;
                r.outer = true;
            } else{
                for(let k = 0; k < line.chars.length; k++){
                    let char = line.chars[k];
                    let centerOfChar = currX + char.width / 2;

                    if(offsetX <= centerOfChar){
                        r.i = k;
                        break;
                    } else if(offsetX > centerOfChar && offsetX < currX + char.width){
                        r.i = k + 1;
                        break;
                    } else if(offsetX >= (currX + line.width)){
                        r.i = line.chars.length;
                        break;
                    }

                    currX += char.width;
                }
            }
            // console.log(r);
            return r;
        };

        // no input parameters
        if(!x && !y){
            result.y = lines.length;

            if(lines.length > 0){
                result.y = lines[0].chars.length;
            } else{
                result.y = 0;
            }
        } else{
            let lineResult = GetLine();

            if(lineResult.outer && !freeMode){
                result = false;
            } else{
                let charResult = GetChar(lines[lineResult.i]);
                result.y = lineResult.i;
                // console.log(charResult);
                if(charResult.outer && !freeMode){
                    result = false;
                } else{
                    result.x = charResult.i;
                }
            }
        }

        return result;
    };

    const SetRange = (movingPos) => {
        let { lines } = textData;
        let C1 = {
            y : editLineIndex,
            x : editCharIndex
        };
        let C2 = GetCursorPos({
            ...movingPos,
            freeMode : true
        });
        let start;
        let end;

        rangeLength = 0

        if(C2.y === C1.y){
            // same line
            if(C1.x < C2.x){
                start = C1;
                end = C2;
            } else if(C2.x === C1.x){
                // same char
                start = C1;
                end = C2;
            } else{
                start = C2;
                end = C1;
            }
        } else{
            if(C2.y < C1.y){
                start = C2;
                end = C1;
            } else{
                start = C1;
                end = C2;
            }
        }

        let inRange = false;

        for(let i = 0; i < lines.length; i++){
            let line = lines[i];

            for(let k = 0; k < line.chars.length; k++){
                if(i >= start.y && k >= start.x){
                    inRange = true
                    rangeLength++;
                }

                if(
                    i > end.y ||
                    (i === end.y && (k >= end.x || k === line.chars.length))
                ){
                    inRange = false;
                }

                lines[i].chars[k].selected = inRange;
            }
        }
    };
    const ClearRange = () =>{
        let { lines } = textData;
        textData.lines.map(({ chars }) => chars.map(char => char.seleted = false));

        for(let i = 0; i < lines.length; i++){
            let line = lines[i];
            for(let k = 0; k < line.chars.length; k++){
                lines[i].chars[k].selected = false;
            }
        }

    }
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
                if(char.selected){
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

                    // console.log(editCharIndex, charIndex);

                    // if last one
                    if(editCharIndex === chars.length){
                        // console.log(' las t one');
                        cursorX = currX;
                    } else if(editCharIndex === charIndex){
                        cursorX = currX - char.width;
                        // console.log(cursorX,currX);
                    }
                }
            });

            currX = textStartPos.x;
            currY += line.height;
        });

        // render cursor
        if(rangeLength === 0 && editing && cursorShowing){
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
        fontSize = this.fontSize || fontSize;
        fontFamily = this.fontFamily || fontFamily;
        fillStyle = this.textColor || fillStyle;
        selectStyle = this.selectStyle || selectStyle;
        textData = null;
        editing = false;

        const move = (event) => {
            let x = isTouch ? event.touches[0].pageX : event.x;
            let y = isTouch ? event.touches[0].pageY : event.y;
            let coord = CoordTransform({
                canvas,
                event : {
                    x : Math.round(x),
                    y : Math.round(y)
                }
            });

            SetRange(coord);
            Render();
            event.preventDefault();
        };

        const up = () => {
            if(rangeLength === 0){
                ClearRange();
                cursorShowing = true
                Render();
            }
            this.OperatingEnd();
            document.removeEventListener(eventsName[1], move);
            document.removeEventListener('selectstart', disabledSelection);
            document.removeEventListener(eventsName[2], up);
        };

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

            if(editing){
                // check click position
                let r = GetCursorPos({ ...coord });

                rangeLength = 0
                editCharIndex = r.x;
                editLineIndex = r.y;
                cursorShowing = true;
                Render();
            } else{
                cloneCanvas = CloneCanvas(this.canvas);
                textStartPos = coord;

                this.OperatingStart();

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

            document.addEventListener(eventsName[1], move, { passive : false });
            document.addEventListener('selectstart', disabledSelection);
            document.addEventListener(eventsName[2], up);
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