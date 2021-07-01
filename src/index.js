import { isTouch, eventsName } from './Utils/Base';
import Pen from './Tool/Pen';
import Eraser from './Tool/Eraser';
import Polygon from './Tool/Polygon';

const toolMap = {
    pen : Pen,
    eraser : Eraser,
    polygon : Polygon,
};

// todo list
// line repair
class PaintBoard{
    lastMouseUpTimeStamp = null;
    isContinuous = null;
    currentTool = null;
    strokeConfig = {
        strokeWidth : 1,
        strokeColor : '#000000'
    };

    constructor({ canvas, strokeConfig = {}, clearColor = '#ffffff', clearRadius = 16, ...rest }){
        this.props = rest;

        // operateCallback = null,
        // enableHistory = false,
        // historyMax = 10,
        let props = this.props;

        props.logicalWidth = Math.round(props.logicalWidth);
        props.logicalHeight = Math.round(props.logicalHeight);
        canvas.width = props.logicalWidth;
        canvas.height = props.logicalHeight;
        Object.assign(this.strokeConfig, strokeConfig);

        this.clearColor = clearColor;
        this.clearRadius = clearRadius;
        this.canvas = canvas;
        this.ctx = canvas.getContext('2d');

        this.Clear();
    }

    OperatingStart(){
        /*if(this.history){
         this.isClean = false;
         this.ClearRedoList();
         // two operates interval less than 1000ms
         isContinuous = (Date.now() - lastMouseUpTimeStamp) < 1000;
         }*/
    }

    Operating(){}

    OperatingEnd(){
        this.lastMouseUpTimeStamp = Date.now();
        /*if(this.history){
         this.Snapshot(isContinuous);
         lastMouseUpTimeStamp = Date.now();
         }*/
    }

    Tool(toolName){
        const newTool = toolMap[toolName];

        // check enabled tool
        if(this.currentTool){
            if(this.currentTool === newTool){
                this.currentTool.Quit();
                this.currentTool = null;
            } else{
                this.currentTool = newTool;
                newTool.Start.apply(this);
            }
        } else{
            this.currentTool = newTool;
            newTool.Start.apply(this);
        }
    }

    Clear(){
        this.ctx.fillStyle = '#ffffff';
        this.ctx.fillRect(0, 0, this.canvas.width, this.canvas.height);
        this.isClean = true;

        /*
         if(this.enableHistory){
         this.ClearRedoList();

         let _b = false;

         if(this.historyIndex > -1){
         _b = this.historyStack[this.historyIndex].t === 'clear';
         }
         this.Snapshot(_b);
         }
         */
    }
}

window.PaintBoard = PaintBoard;