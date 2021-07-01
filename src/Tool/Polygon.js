import { isTouch, eventsName } from '../Utils/Base';
import CoordTransform from '../Utils/CoordTransform';
import Stroke from '../Utils/Stroke';

const Polygon = (() => {
    let canvas = null;
    let ctx = null;
    let points = [];
    let that = null;
    let cloneCanvas = null;

    const CloneCanvas = (origin) => {
        let target = document.createElement('canvas');
        let cvs = target.getContext('2d');

        target.width = origin.width;
        target.height = origin.height;

        cvs.drawImage(origin, 0, 0);

        return target;
    };

    const HandleMove = (event) => {
        if(points.length > 0){
            let x = isTouch ? event.touches[0].pageX : event.x;
            let y = isTouch ? event.touches[0].pageY : event.y;
            let currCoord = CoordTransform({
                canvas,
                event : {
                    x,
                    y
                }
            });
            let endPoint = points[points.length - 1];

            endPoint.x = currCoord.x;
            endPoint.y = currCoord.y;
            Render();
        }

    };

    const Render = () => {
        let { strokeWidth, strokeColor } = that.strokeConfig;
        let { width, height } = that.canvas;

        ctx.clearRect(0, 0, width, height);
        ctx.drawImage(cloneCanvas, 0, 0);

        for(let i = 0; i < points.length; i++){
            let lastP = null;
            let currP = points[i];

            if(points.length === 0){
                lastP = currP;
            } else{
                if(i === 0){
                    lastP = points[points.length - 1];
                } else{
                    lastP = points[i - 1];
                }
            }

            Stroke({
                ctx,
                start : lastP,
                end : currP,
                strokeWidth,
                strokeColor
            });
        }
    };

    const Start = function(){
        // create a local snapshot
        cloneCanvas = CloneCanvas(this.canvas);

        that = this;
        canvas = this.canvas;
        ctx = this.ctx;

        const disabledSelection = (event) => {
            event.preventDefault();
        };

        const up = (event) => {
            console.log();
            if(points.length === 0){
                return;
            }

            if(!isTouch){
                console.log('ev');
                let { x, y } = points[points.length - 1];
                console.log(points);
                // and set new end
                points.push(
                    {
                        x,
                        y
                    }
                );
            }

            Render();

            document.removeEventListener('selectstart', disabledSelection);
            document.removeEventListener(eventsName[2], up);
        };

        // gesture start
        canvas['on' + eventsName[0]] = (event) => {
            // non-touch device and left click
            // prevent
            if(!isTouch && event.buttons !== 1){
                return;
            }

            let x = isTouch ? event.touches[0].pageX : event.x;
            let y = isTouch ? event.touches[0].pageY : event.y;

            let currCoord = CoordTransform({
                canvas,
                event : {
                    x,
                    y
                }
            });

            if(isTouch){
                points.push(
                    {
                        ...currCoord
                    }
                );
            }else{
                if(points.length === 0){
                    // start and end
                    points.push(
                        {
                            ...currCoord
                        },
                        {
                            ...currCoord
                        }
                    );
                }
            }

            document.addEventListener('selectstart', disabledSelection);
            document.addEventListener(eventsName[2], up);
        };

        canvas.oncontextmenu = (event) => {
            event.preventDefault();
            points.length -= 1;
            Render();
            points.length = 0;

            // update clone canvas
            cloneCanvas = CloneCanvas(this.canvas);
            this.OperatingEnd();
        };

        if(!isTouch){
            document.addEventListener(eventsName[1], HandleMove);
        }
    };

    const Quit = function(){
        points.length = 0;
        canvas.oncontextmenu = null;
        canvas['on' + eventsName[0]] = null;
        if(!isTouch){
            document.removeEventListener(eventsName[1], HandleMove);
        }
    };

    return {
        Start,
        Quit
    };
})();

export default Polygon;