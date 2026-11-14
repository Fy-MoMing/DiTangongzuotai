import React, { useEffect, useRef, useState } from 'react';
import { FaRuler, FaImage, FaCopy, FaEraser, FaSave } from 'react-icons/fa';
import striped from '../assets/carpets/style-1.jpg';
import diamond from '../assets/carpets/style-2.jpg';
import grid from '../assets/carpets/style-3.jpg';
import hardSilk from '../assets/carpets/style-4.jpg';
import flat from '../assets/carpets/style-5.jpg';
import wideStriped from '../assets/carpets/style-6.jpg';
const styles = [{name:'条纹',url:striped},{name:'菱形纹',url:diamond},{name:'方格',url:grid},{name:'硬丝',url:hardSilk},{name:'平面',url:flat},{name:'宽条纹',url:wideStriped}];

function ImageEditor() {
  const [width,setWidth] = useState('');
  const [height,setHeight] = useState('');
  const [styleIndex,setStyleIndex] = useState(0);
  const [loaded,setLoaded] = useState(false);
  const [saving,setSaving] = useState(false);
  const [error,setError] = useState('');
  const [widthPosition,setWidthPosition] = useState({x:30,y:50});
  const [heightPosition,setHeightPosition] = useState({x:30,y:90});
  const [dragging,setDragging] = useState(null);
  const canvasRef = useRef(null);
  const imageRef = useRef(null);
  const dragOffset = useRef({x:0,y:0});
  useEffect(()=>{
    let canceled=false;
    setLoaded(false);
    const image=new Image();
    image.onload=()=>{
      if(canceled)return;
      const canvas=canvasRef.current;
      const ratio=Math.min(1,800/image.width,600/image.height);
      canvas.width=Math.round(image.width*ratio);
      canvas.height=Math.round(image.height*ratio);
      imageRef.current=image;
      canvas.getContext('2d').drawImage(image,0,0,canvas.width,canvas.height);
      setLoaded(true);setError('');
    };
    image.onerror=()=>{if(!canceled)setError('图片加载失败，请重新选择样式。');};
    image.src=styles[styleIndex].url;
    return()=>{canceled=true;};
  },[styleIndex]);
  const draw=()=>{
    const canvas=canvasRef.current;
    if(!canvas||!imageRef.current||!loaded)return;
    const ctx=canvas.getContext('2d');
    ctx.clearRect(0,0,canvas.width,canvas.height);
    ctx.drawImage(imageRef.current,0,0,canvas.width,canvas.height);
    ctx.font='600 24px "Noto Sans SC", sans-serif';ctx.strokeStyle='#fff';ctx.lineWidth=3;
    if(width){const text=`宽: ${width}cm`;ctx.fillStyle='#e74b6f';ctx.strokeText(text,widthPosition.x,widthPosition.y);ctx.fillText(text,widthPosition.x,widthPosition.y);}
    if(height){const text=`长: ${height}cm`;ctx.fillStyle='#408de0';ctx.strokeText(text,heightPosition.x,heightPosition.y);ctx.fillText(text,heightPosition.x,heightPosition.y);}
  };
  useEffect(()=>{draw();},[width,height,widthPosition,heightPosition,loaded,styleIndex]);
  const position=event=>{
    const canvas=canvasRef.current,rect=canvas.getBoundingClientRect();
    return{x:(event.clientX-rect.left)*canvas.width/rect.width,y:(event.clientY-rect.top)*canvas.height/rect.height};
  };
  const startDrag=event=>{
    const p=position(event);
    const contains=(point,text)=>p.x>=point.x-10&&p.x<=point.x+canvasRef.current.getContext('2d').measureText(text).width+10&&p.y>=point.y-29&&p.y<=point.y+10;
    const target=width&&contains(widthPosition,`宽: ${width}cm`)?'width':height&&contains(heightPosition,`长: ${height}cm`)?'height':null;
    if(!target)return;
    const point=target==='width'?widthPosition:heightPosition;
    dragOffset.current={x:p.x-point.x,y:p.y-point.y};setDragging(target);
    event.currentTarget.setPointerCapture(event.pointerId);
  };
  const moveDrag=event=>{
    if(!dragging)return;
    const p=position(event),canvas=canvasRef.current;
    const text=dragging==='width'?`宽: ${width}cm`:`长: ${height}cm`;
    const textWidth=canvas.getContext('2d').measureText(text).width;
    const next={x:Math.max(10,Math.min(p.x-dragOffset.current.x,canvas.width-textWidth-10)),y:Math.max(30,Math.min(p.y-dragOffset.current.y,canvas.height-10))};
    if(dragging==='width')setWidthPosition(next);else setHeightPosition(next);
  };
  const copy=async()=>{
    setError('');
    try{
      draw();const canvas=canvasRef.current;
      if(window.desktop?.copyImage)await window.desktop.copyImage(canvas.toDataURL('image/png'));
      else{const blob=await new Promise(resolve=>canvas.toBlob(resolve,'image/png'));if(!blob)throw new Error();await navigator.clipboard.write([new ClipboardItem({'image/png':blob})]);}
    }catch{setError('图片复制失败，请重试或保存到电脑。');}
  };
  const save=async()=>{
    if(!loaded||saving)return;setSaving(true);setError('');
    try{draw();const data=canvasRef.current.toDataURL('image/png');if(window.desktop?.saveImage)await window.desktop.saveImage(data);else{const link=document.createElement('a');link.href=data;link.download='地毯尺寸标记.png';link.click();}}
    catch{setError('图片保存失败，请检查保存位置后重试。');}finally{setSaving(false);}
  };
  const clear=()=>{setWidth('');setHeight('');setError('');setWidthPosition({x:30,y:50});setHeightPosition({x:30,y:90});};
  return <>
    <div className="section-heading"><span className="step-number"><FaImage /></span><div><h2>图片尺寸标记工具</h2><p>标记宽长、自由拖动，导出一张清楚的尺寸图</p></div><span className="live-indicator"><i />本地编辑</span></div>
    <div className="editor-layout"><div className="editor-controls">
      <label htmlFor="image-width">宽度 / 厘米<input id="image-width" type="number" min="0" placeholder="例如：120" value={width} onChange={e=>setWidth(e.target.value)} /></label>
      <label htmlFor="image-height">长度 / 厘米<input id="image-height" type="number" min="0" placeholder="例如：150" value={height} onChange={e=>setHeight(e.target.value)} /></label>
      <button className="primary-button editor-button" onClick={draw} disabled={!loaded||(!width&&!height)}><FaRuler />标记图片</button>
      <p className="editor-styles-label">选择图片样式</p><div className="editor-styles">{styles.map((style,index)=><button key={style.name} className={`editor-style ${index===styleIndex?'selected':''}`} onClick={()=>setStyleIndex(index)} aria-label={style.name}><img src={style.url} alt="" />{style.name}</button>)}</div>
      <div className="editor-actions"><button className="secondary-button" onClick={copy} disabled={!loaded||(!width&&!height)}><FaCopy />复制</button><button className="secondary-button" onClick={clear} disabled={!loaded}><FaEraser />清除</button></div>
      <button className="primary-button editor-save" onClick={save} disabled={!loaded||saving}><FaSave />{saving?'保存中…':'保存图片'}</button>
      {error&&<p className="inline-error" role="alert">{error}</p>}
      <p className="editor-hint">拖动图片中的尺寸文字，即可调整标记位置。复制后可直接粘贴到聊天窗口，也可以保存为 PNG 图片。</p>
    </div><div className="editor-preview"><div className="editor-preview-head">尺寸预览<span>{styles[styleIndex].name} / PNG</span></div><div className="canvas-surface"><canvas ref={canvasRef} style={{cursor:dragging?'grabbing':((width||height)?'grab':'default'),touchAction:'none'}} onPointerDown={startDrag} onPointerMove={moveDrag} onPointerUp={()=>setDragging(null)} onPointerCancel={()=>setDragging(null)} /></div><p className="canvas-caption">所有处理均在本地完成 · 图片不会上传</p></div></div>
  </>;
}

export default React.memo(ImageEditor);
