/*
*
*
* */

class PaintBoard{
    props = null;
    isPainting = false;
    isClean = true;
    isContinuous = false;
    _lastMouseUpTimeStamp = null;
    strokeConfig = {
        strokeWidth : 1,
        strokeColor : '#000000'
    };

    constructor(props){
        let { canvas, width, height, inputEventFunc, history = false, historyMax = 10 } = props;

        canvas.width = width;
        canvas.height = height;

        this.props = props;
        this.canvas = canvas;
        this.ctx = canvas.getContext('2d');

        this.Init();

        if(history){
            this.history = history;
            this.historyMax = history;
            this.historyIndex = 0;
            this.historyStack = [
                {
                    t : 'init'
                }
            ];
        }
    }

    Init(){
        let { canvas, ctx } = this;
        const disabledSelection = (event) => {
            event.preventDefault();
        };
        const move = (event) => {
            let { strokeWidth, strokeColor } = this.strokeConfig;
            let currCoord = PaintBoard.CoordTransform({
                canvas,
                event
            });

            PaintBoard.Stroke({
                lastCoord : this.lastCoord,
                currCoord,
                ctx,
                strokeWidth,
                strokeColor
            });

            this.lastCoord = currCoord;
        };
        const up = () => {
            this.isPainting = false;

            if(this.history){
                this.Snapshot(this.isContinuous);
                this._lastMouseUpTimeStamp = Date.now();
            }
            document.removeEventListener('mousemove', move);
            document.removeEventListener('selectstart', disabledSelection);
            document.removeEventListener('mouseup', up);
        };

        this.canvas.onmousedown = (event) => {
            this.isPainting = true;
            this.lastCoord = PaintBoard.CoordTransform({
                canvas,
                event
            });

            if(this.history){
                this.isClean = false;
                this.ClearRedoList();
                // two operates interval less than 500ms
                this.isContinuous = (Date.now() - this._lastMouseUpTimeStamp) < 1000;
            }

            document.addEventListener('mousemove', move);
            document.addEventListener('selectstart', disabledSelection);
            document.addEventListener('mouseup', up);
        };
    }

    SaveData(){

    }

    Destroy(){

    }

    ToggleErase(){
    }

    Snapshot(replace = false){
        let historyItem = null;
        // cleared
        console.log('Snapshot - isClean - ', this.isClean);
        if(this.isClean){
            historyItem = {
                t : 'clear'
            };

        } else{
            historyItem = {
                time : Date.now(),
                data : this.canvas.getContext('2d')
                           .getImageData(0, 0, this.canvas.width, this.canvas.height).data
            };
        }

        // replace
        if(replace){
            this.historyStack.pop();
        }

        // handle maximum to avoids overflow
        if(this.historyStack.length + 1 > this.historyMax){
            this.historyStack.unshift();
        }

        this.historyStack.push(historyItem);
        this.historyIndex = this.historyStack.length - 1;
        console.log(this.historyStack, this.historyIndex);
    }

    ApplyHistory(){
        let handleData = this.historyStack[this.historyIndex];

        if(handleData){
            if(handleData.t === 'init' || handleData.t === 'clear'){
                this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);
                this.isClean = true;
            } else{
                let imageData = new ImageData(handleData.data, this.canvas.width, this.canvas.height);
                this.ctx.putImageData(imageData, 0, 0);
            }
        }
    }

    // New operations will clear
    ClearRedoList(){
        this.historyStack.length = this.historyIndex + 1;
    }

    Undo(){
        this.historyIndex -= 1;

        if(this.historyIndex < 0){
            this.historyIndex = 0;
        }

        this.ApplyHistory();
    }

    Redo(){
        this.historyIndex += 1;

        if(this.historyIndex > this.historyStack.length - 1){
            this.historyIndex = this.historyStack.length - 1;
        } else{
            this.ApplyHistory();
        }
    }

    Clear(){
        this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);
        this.isClean = true;
        this.ClearRedoList();
        this.Snapshot(this.historyStack[this.historyIndex].t === 'clear');
    }

    static Stroke({ ctx, lastCoord, currCoord, strokeWidth, strokeColor }){
        ctx.beginPath();
        ctx.lineCap = 'round';
        ctx.lineWidth = strokeWidth;
        ctx.strokeStyle = strokeColor;
        ctx.moveTo(lastCoord.x, lastCoord.y);
        ctx.lineTo(currCoord.x, currCoord.y);
        ctx.stroke();
    }

    static CoordTransform({ canvas, event }){
        let _rect = canvas.getBoundingClientRect();
        let x = event.x - _rect.x;
        let y = event.y - _rect.y;

        return {
            x,
            y
        };
    }
}