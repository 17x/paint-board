window.addEventListener('load', Onload);

function Onload(){
    let canvas = document.createElement('canvas');
    let ctx = canvas.getContext('2d');
    let paintBoard = new PaintBoard({
        canvas,
        width : 500,
        height : 300,
        showTool : true
    });
    let toolbarConfig = {
        attrs : [
            {
                code : 'lineWidth',
                name : '线粗',
                type : 'select',
                options : new Array(10).fill(undefined)
                                       .map((v, i) => {
                                           return i + 1;
                                       }),
                cb : (v) => {
                    paintBoard.strokeConfig.strokeWidth = Number(v.target.value);
                }
            }, {
                code : 'strokeColor',
                type : 'color-picker',
                name : '线色',
                cb : (v) => {
                    paintBoard.strokeConfig.strokeColor = v;
                }
            }
        ],
        methods : [
            {
                code : 'undo',
                name : '⎌'
            },
            {
                code : 'redo'
            },
            {
                code : 'eraser',
                radius : 5
            },
            {
                code : 'clear'
            },
            {
                code : 'paintBucket'
            }
        ]/*,
        shapes : [
            'pentagram',
            'rPolygon'
        ]*/
    };
    let toolbar = document.createElement('div');

    toolbarConfig.attrs.map(attr => {
        let toolbarDomItem = document.createElement('div');
        let itemName = document.createElement('div');

        toolbarDomItem.id = attr.code;
        itemName.innerHTML = attr.name;
        toolbarDomItem.append(itemName);

        if(attr.type === 'select'){
            let select = document.createElement('select');
            attr.options.map(option => {
                let optionDom = document.createElement('option');
                optionDom.value = option;
                optionDom.innerHTML = option;
                select.append(optionDom);
            });

            select.selectedIndex = 0;
            select.onchange = attr.cb;
            toolbarDomItem.append(select);
        } else if(attr.type === 'color-picker'){
            let color = document.createElement('div');

            color.style.width = '80px';
            color.style.height = '30px';
            color.style.backgroundColor = '#000000';
            toolbarDomItem.append(color);
        }

        toolbar.append(toolbarDomItem);
    });
    toolbarConfig.methods.map(method => {
        let toolbarDomItem = document.createElement('div');
        toolbarDomItem.innerHTML = method.name;

        toolbar.append(toolbarDomItem);
    });
    document.body.append(canvas, toolbar);

}