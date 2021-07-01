import { isTouch, eventsName } from '../Utils/Base';
import CoordTransform from '../Utils/CoordTransform';
import Stroke from '../Utils/Stroke';

const PenTool = (() => {
    let canvas = null;
    let ctx = null;

    const Start = function(){
        canvas = this.canvas;
        ctx = this.ctx;
        const disabledSelection = (event) => {
            event.preventDefault();
        };
        let lastCoord = null;
        let lastMouseUpTimeStamp = null;
        let isContinuous = null;

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

            Stroke({
                start : lastCoord,
                end : currCoord,
                ctx,
                strokeWidth,
                strokeColor
            });

            lastCoord = currCoord;
        };

        const up = () => {
            if(this.history){
                this.Snapshot(isContinuous);
                lastMouseUpTimeStamp = Date.now();
            }
            document.removeEventListener(eventsName[1], move);
            document.removeEventListener('selectstart', disabledSelection);
            document.removeEventListener(eventsName[2], up);
        };

        canvas['on' + eventsName[0]] = (event) => {
            let { strokeWidth, strokeColor } = this.strokeConfig;
            let x = isTouch ? event.touches[0].pageX : event.x;
            let y = isTouch ? event.touches[0].pageY : event.y;

            lastCoord = CoordTransform({
                canvas,
                event : {
                    x,
                    y
                }
            });

            if(this.history){
                this.isClean = false;
                this.ClearRedoList();
                // two operates interval less than 500ms
                isContinuous = (Date.now() - lastMouseUpTimeStamp) < 1000;
            }

            Stroke({
                start : lastCoord,
                end : lastCoord,
                ctx,
                strokeWidth,
                strokeColor
            });

            document.addEventListener(eventsName[1], move);
            document.addEventListener('selectstart', disabledSelection);
            document.addEventListener(eventsName[2], up);
        };
    };

    // 
    const Quit = function(){
        return new Promise((resolve, reject) => {
            canvas['on' + eventsName[0]] = null;
            resolve();
        });
    };

    return {
        Start,
        Quit
    };
})();

export default PenTool;