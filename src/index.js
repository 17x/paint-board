import { isTouch, eventsName } from './Utils/Base';
import Pen from './Tool/Pen';
import Eraser from './Tool/Eraser';
import Polygon from './Tool/Polygon';
import PaintBucket from './Tool/PaintBucket';

const toolMap = {
    pen : Pen,
    eraser : Eraser,
    polygon : Polygon,
    paintBucket : PaintBucket
};

// todo list
// line repair
// redo and undo apply into polygon creation
class PaintBoard{
    lastOperatingEnd = null;
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
        console.log('OperatingStart');
        /*if(this.history){
         this.isClean = false;
         this.ClearRedoList();
         // two operates interval less than 1000ms
         isContinuous = (Date.now() - lastOperatingEnd) < 1000;
         }*/
    }

    Operating(){
        // console.log('Operating');

    }

    OperatingEnd(){
        console.log('OperatingEnd');
        this.lastOperatingEnd = Date.now();
        /*if(this.history){
         this.Snapshot(isContinuous);
         lastOperatingEnd = Date.now();
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

    // take a snapshot
    Snapshot(replace = false){
        let historyItem = null;
        // cleared
        // console.log('Snapshot - isClean - ', this.isClean);
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
        if(this.historyStack.length >= this.historyMax){
            this.historyStack.shift();
            // console.log(this.historyStack.length);
        }

        this.historyStack.push(historyItem);
        this.historyIndex = this.historyStack.length - 1;
        // console.log(this.historyStack, this.historyIndex);
    }

}

window.PaintBoard = PaintBoard;