// Small, clear JS to run the full 5-scene flow and photo-picker

document.addEventListener('DOMContentLoaded', ()=>{
  const sceneBalloons = document.getElementById('scene-balloons');
  const sceneMail = document.getElementById('scene-mail');
  const scenePhotos = document.getElementById('scene-photos');
  const sceneContinue = document.getElementById('scene-continue');
  const sceneLetter = document.getElementById('scene-letter');
  const envelope = document.getElementById('envelope');
  const photoFrames = [document.getElementById('photo1'),document.getElementById('photo2'),document.getElementById('photo3'),document.getElementById('photo4')];
  const continueBtn = document.getElementById('continueBtn');
  const floatingLayer = document.getElementById('balloon-layer');
  const photoInput = document.getElementById('photoInput');

  const PHOTO_MS = 10000; // 10s per photo
  const BALLOON_MS = 7000; // 7s opening

  // placeholders (will be replaced if user selects photos)
  const placeholders = ['assets/iiii.jpg','assets/image copy.jpg','assets/image.jpg','assets/image0.jpg'];

  // create ambient hearts and sparkles (lightweight)
  (function createAmbient(){
    const heartsContainer = document.getElementById('floating-hearts');
    const sparkles = document.getElementById('sparkles');
    // create looping ambient hearts (reduced CPU by using CSS animation)
    const HEART_COUNT = 15;
    for(let i=0;i<HEART_COUNT;i++){
      const h = document.createElement('div'); h.className='ambient-heart'; h.textContent='❤';
      const left = 5 + Math.random()*90; const bottom = -10 - Math.random()*30;
      h.style.left = left + '%'; h.style.bottom = bottom + 'px';
      h.style.opacity = 0.6 + Math.random()*0.35;
      // randomize CSS animation vars
      const dur = 8000 + Math.random()*10000;
      const delay = Math.random()*3000;
      const sway = (Math.random()*36 - 18).toFixed(1) + 'px';
      h.style.setProperty('--dur', dur + 'ms');
      h.style.setProperty('--delay', delay + 'ms');
      h.style.setProperty('--sway', sway);
      heartsContainer.appendChild(h);
    }
    // sparkles (short-lived decorative elements)
    for(let s=0;s<6;s++){
      const sp = document.createElement('div'); sp.className='sparkle'; sparkles.appendChild(sp);
      sp.style.left = (20 + Math.random()*60)+'%'; sp.style.top = (20 + Math.random()*60)+'%';
      setTimeout(()=>{ sp.animate([{opacity:0},{opacity:1},{opacity:0}],{duration:1600+Math.random()*1200,iterations:1}); setTimeout(()=>{ sp.remove(); }, 2000); }, Math.random()*1200);
    }
  })();

  // create balloons for opening
  (function makeBalloons(){
    const count = 10;
    for(let i=0;i<count;i++){
      const b = document.createElement('div'); b.className='balloon';
      if(Math.random()>0.7){ b.classList.add('heart'); }
      const left = 6 + Math.random()*88; b.style.left = left + '%'; b.style.bottom = '-140px';
      const dur = 6000 + Math.random()*3000; const delay = Math.random()*1200;
      b.style.animation = `rise ${dur}ms linear ${delay}ms forwards`;
      // gentle sway via WAAPI
      b.animate([{transform:'translateX(0)'},{transform:'translateX(18px)'},{transform:'translateX(0)'}],{duration:2000+Math.random()*2000,iterations:Infinity,delay:delay});
      floatingLayer.appendChild(b);
      setTimeout(()=>{ try{ b.remove(); }catch(e){} }, dur + delay + 1000);
    }
  })();

  // after balloons, show envelope scene and give the envelope a quick shake hint
  setTimeout(()=>{
    sceneBalloons.classList.add('hidden');
    sceneMail.classList.remove('hidden');
    try{
      envelope.classList.add('shake');
      envelope.classList.add('pulse-hint');
      setTimeout(()=>{ envelope.classList.remove('shake'); }, 900);
      // remove hint after a short while so it doesn't distract
      setTimeout(()=>{ envelope.classList.remove('pulse-hint'); }, 2800);
    }catch(e){}
  }, BALLOON_MS);

  // When envelope clicked -> open, play music, then photo-picker and photos
  function openEnvelope(){
    envelope.classList.add('envelope-open');

    // invoke photo picker right after opening
    setTimeout(()=>{
      // open file picker to choose up to 4 photos
      photoInput.value = null; photoInput.multiple = true; photoInput.accept = 'image/*';
      photoInput.click();

      // if user selects files, use them; otherwise use placeholders
      photoInput.onchange = (e)=>{
        const files = Array.from(e.target.files || []).slice(0,4);
        if(files.length>0){
          const urls = files.map(f => URL.createObjectURL(f));
          startPhotos(urls);
        } else {
          startPhotos(placeholders);
        }
      };
      // fallback: if user closes picker without selecting, proceed with placeholders after 1.2s
      setTimeout(()=>{ if(!photoInput.files.length) startPhotos(placeholders); }, 1400);

      // hide mail and show photo stage
      sceneMail.classList.add('hidden'); scenePhotos.classList.remove('hidden');
    }, 700);
  }
  envelope.addEventListener('click', openEnvelope);
  envelope.addEventListener('keydown',(e)=>{ if(e.key==='Enter' || e.key===' ') { e.preventDefault(); openEnvelope(); } });

  // show photos one by one; accepts array of 4 image URLs
  function startPhotos(urls){
    let idx = 0;
    function showNext(){
      if(idx>0){ // fade out previous frame
        const prev = photoFrames[idx-1]; prev.animate([{opacity:1,transform:'scale(1)'},{opacity:0,transform:'scale(.98)'}],{duration:700,fill:'forwards'});
      }
      if(idx >= photoFrames.length){
        // done -> show continue
        sceneContinue.classList.remove('hidden'); return;
      }
      const frame = photoFrames[idx]; frame.className='photo-frame';
      const img = frame.querySelector('img'); if(img) img.src = urls[idx] || placeholders[idx];
      // entrances per spec: 1-left,2-right,3-top,4-bottom
      const classes = ['from-left','from-right','from-top','from-bottom'];
      frame.classList.add(classes[idx]); frame.style.opacity = 1;
      idx++;
      // schedule next
      setTimeout(showNext, PHOTO_MS);
    }
    showNext();
  }

  // Audio removed: play button and autoplay fallback disabled

  // Continue button -> show letter with typewriter
  // ensure continue button exists (if not in DOM, create)
  (function ensureContinue(){ if(!continueBtn){ const c = document.createElement('div'); c.id='scene-continue'; c.className='scene hidden'; document.getElementById('app').appendChild(c); } })();
  const btn = document.getElementById('continueBtn') || (function(){ const b = document.createElement('button'); b.id='continueBtn'; b.textContent='One more thing… 💖'; b.className='hidden'; document.getElementById('scene-continue').appendChild(b); return b; })();
  document.getElementById('scene-continue').classList.add('hidden');

  btn.addEventListener('click', ()=>{
    sceneContinue.classList.add('hidden'); sceneLetter.classList.remove('hidden');
      const text = `We met online in 2022, in the most unexpected way, while playing Minecraft.
  What started as a simple game slowly turned into late-night conversations, laughter, comfort, and a connection I never planned but instantly cherished.

  In 2022, friendship turned into love.
  And even though there was distance between us, our hearts never felt far apart.

  Three years later, on November 27, 2025, the moment we had waited for finally came — we met in real life.
  From pixels to reality, from screens to smiles, everything felt surreal and perfect, like our story was always meant to happen.

  You are my safe place, my happiness, and my favorite person.
  Thank you for choosing me every day, for loving me the way you do, and for being my constant through every level of life.

  On your birthday, I just want you to know this:
  No matter where life takes us, no matter how many chapters are still unwritten, I will always be right beside you — loving you, supporting you, and growing with you.

  Happy Birthday, my love ❤️
  From a game that brought us together to a life we are building together — forever us.`;
    typewriter(text, document.getElementById('typewriter'));
  });

  // simple typewriter
  function typewriter(text, el){ el.textContent=''; let i=0; function step(){ if(i<text.length){ el.textContent += text[i++]; setTimeout(step, 36 + Math.random()*40); } else { /* finished */ } } step(); }

});