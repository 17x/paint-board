/*
*
*
* */

class PaintBoard{
    props = null;
    _painting = false;
    strokeConfig = {
        strokeWidth : 1,
        strokeColor : '#000000'
    };

    constructor(props){
        let { canvas, width, height, inputEventFunc, ...rest } = props;

        canvas.width = width;
        canvas.height = height;

        this.props = props;
        this.canvas = canvas;
        this.ctx = canvas.getContext('2d');

        this.Init();
    }

    Init(){
        let { canvas, ctx } = this;
        const move = (event) => {
            let { strokeWidth, strokeColor } = this.strokeConfig;
            let currCoord = PaintBoard.CoordTransform({
                canvas,
                event
            });

            PaintBoard.Stroke({
                lastCoord : this._lastCoord,
                currCoord,
                ctx,
                strokeWidth,
                strokeColor
            });

            this._lastCoord = currCoord;
        };

        this.canvas.onmousedown = (event) => {
            this._painting = true;
            this._lastCoord = PaintBoard.CoordTransform({
                canvas,
                event
            });
            document.addEventListener('mousemove', move);
            document.addEventListener('mouseup', () => {
                this._painting = false;
                document.removeEventListener('mousemove', move);
            });
        };
    }

    SaveData(){

    }

    Destroy(){

    }

    static Stroke({ ctx, lastCoord, currCoord, strokeWidth, strokeColor }){
        ctx.beginPath();
        ctx.lineCap = 'round';
        ctx.lineWidth = strokeWidth;
        ctx.strokeStyle = strokeColor;
        console.log(lastCoord, currCoord);
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