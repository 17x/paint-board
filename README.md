# paint-board



### basic usage

```js
let paintBoard = new PaintBoard({
  canvas,
  logicalWidth : window.innerWidth,
  logicalHeight : window.innerHeight,
  strokeConfig : {
    strokeWidth : 10,
    strokeColor : penColor
  }
});

paintBoard.Tool('pen');
```

---

### Demo List

- [basic usage](https://17x.github.io/paint-board-demo/basic)
- [enable history](https://17x.github.io/paint-board-demo/history)
- [load background, transparency back and optional output](https://17x.github.io/paint-board-demo/bg-and-clear)
- [more tools]()

---

### configs

**`canvas`** 

HTMLCanvasElement

destination output

**`logicalWidth`** Number

canvas resolution width



**`logicalHeight`** Number

canvas resolution height



**`strokeConfig`** Object

​	contains

- **`strokeWidth`** Number
   line width to init
- **`strokeColor`** String
   line color to init



**`background`** Object

contains

- **`color`** String

- **`image`** HTMLImageElement



**`enableHistory`** Boolean

enable history



**`historyMax`** Number

history record stack max length



**`clearColor`** String

if you wanna do  **real clear** , just set its value to **transparent**



**`clearRadius`** Number

actually clear is not a line but a dot.

---


### Method codes

INSTANCE.Method(CODE)



**`Undo`**

Apply last one (base on current history index) history record

**enableHistory** is required



**`Redo`**

Apply next one (base on current history index) history record

**enableHistory** is required



**`clear`**

Clean canvas



---

### Tool codes

INSTANCE.Tool(CODE)

**`pen`**

**`line`**

**`polygon`**

**`eraser`**

---

### Other

**`SaveData`** Function with one object parameter

that object contains

- **`returnType`** String

  arraybuffer

  beware arraybuffer do not contains metadata or other infos but only pixels data.

  

  file

  This return a **real file** that like you choose a file from local.

  you need combine use the cb parameter.

  

  base64

  return string

  

- **`compBg`** Boolean

  represent the output will be blend with background image (in the config).

- **`cb`** Function

  callback for **returnType : 'file'** since this is an asynchronously action.

