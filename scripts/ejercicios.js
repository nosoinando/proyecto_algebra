// scripts/ejercicios.js
// Un pequeño módulo para validar respuestas con tolerancia y aceptando formas equivalentes simples.

const Ejercicios = (function(){
  function parseLinearExpr(str){
    // convierte expresiones como "50x1 + 35x2" o "Z=50 x1+35 x2" a coeficientes [50,35]
    if(!str) return null;
    str = str.replace(/Z|z|=/g,'').replace(/\s+/g,'');
    // poner signos explícitos
    str = str.replace(/([+\-]?)(\d+)(x1)/g,'$1$2x1').replace(/([+\-]?)(\d+)(x2)/g,'$1$2x2');
    const match1 = str.match(/([+\-]?\d+)x1/);
    const match2 = str.match(/([+\-]?\d+)x2/);
    if(!match1 && !match2) return null;
    const a = match1 ? parseFloat(match1[1]) : 0;
    const b = match2 ? parseFloat(match2[1]) : 0;
    return [a,b];
  }

  function parseConstraint(str){
    // espera algo como "3x1+2x2<=100" o "x2<=30"
    if(!str) return null;
    const cleaned = str.replace(/\s+/g,'').replace(/≤/g,'<=').replace(/≥/g,'>=');
    const parts = cleaned.split(/(<=|>=|=)/);
    if(parts.length < 3) return null;
    const lhs = parts[0];
    const op = parts[1];
    const rhs = parseFloat(parts[2]);
    const m1 = lhs.match(/([+\-]?\d*)x1/);
    const m2 = lhs.match(/([+\-]?\d*)x2/);
    const c1 = m1 ? (m1[1]===''||m1[1]==='+'?1:(m1[1]==='-'?-1:parseFloat(m1[1]))) : 0;
    const c2 = m2 ? (m2[1]===''||m2[1]==='+'?1:(m2[1]==='-'?-1:parseFloat(m2[1]))) : 0;
    return {coeffs:[c1,c2], op, rhs};
  }

  function approxEqual(a,b,tol=1e-6){ return Math.abs(a-b) <= tol; }

  function showFeedback(el, messages){
    const container = typeof el === 'string' ? document.querySelector(el) : el;
    container.innerHTML = '';
    messages.forEach(m=>{
      const div = document.createElement('div');
      div.className = m.ok ? 'alert alert-success' : 'alert alert-danger';
      div.innerHTML = (m.ok ? '✔ ' : '✘ ') + m.text;
      container.appendChild(div);
    });
  }

  function initEjercicio(opts){
    const id = opts.id;
    if(id === 1){
      const btn = document.querySelector(opts.inputs.btn);
      btn.addEventListener('click', ()=>{
        const obj = parseLinearExpr(document.querySelector(opts.inputs.obj).value);
        const r1 = parseConstraint(document.querySelector(opts.inputs.r1).value);
        const r2 = parseConstraint(document.querySelector(opts.inputs.r2).value);
        const r3 = parseConstraint(document.querySelector(opts.inputs.r3).value);
        const fb = document.querySelector(opts.inputs.feedback);
        const msgs = [];

        // objetivo
        if(obj && obj[0]===opts.objetivoCorrecto.coeffs[0] && obj[1]===opts.objetivoCorrecto.coeffs[1]){
          msgs.push({ok:true, text:'Función objetivo correcta.'});
        } else {
          msgs.push({ok:false, text:`Función objetivo incorrecta. La correcta es: Z = ${opts.objetivoCorrecto.coeffs[0]}x1 + ${opts.objetivoCorrecto.coeffs[1]}x2`});
        }

        // restricciones
        const checkRestr = (r, correct, idx)=>{
          if(!r){ return {ok:false, text:`Restricción ${idx} no entendida.`}; }
          const okCoeffs = approxEqual(r.coeffs[0], correct.coeffs[0]) && approxEqual(r.coeffs[1], correct.coeffs[1]);
          const okOp = r.op === correct.op;
          const okRhs = approxEqual(r.rhs, correct.rhs);
          if(okCoeffs && okOp && okRhs) return {ok:true, text:`Restricción ${idx} correcta.`};
          // intentar aceptar permutación o coeficiente implícito
          return {ok:false, text:`Restricción ${idx} incorrecta. Correcta: ${correct.coeffs[0]}x1 + ${correct.coeffs[1]}x2 ${correct.op} ${correct.rhs}`};
        };

        msgs.push(checkRestr(r1, opts.restricciones[0], 1));
        msgs.push(checkRestr(r2, opts.restricciones[1], 2));
        msgs.push(checkRestr(r3, opts.restricciones[2], 3));

        showFeedback(fb, msgs);
      });
    }

    if(id === 2){
      const btn = document.querySelector(opts.inputs.btn);
      btn.addEventListener('click', ()=>{
        const fb = document.querySelector(opts.inputs.feedback);
        const detUser = parseFloat(document.querySelector(opts.inputs.det).value);
        // Matriz A = [[2,3],[1,4]]
        const detCorrect = 2*4 - 3*1;
        const msgs = [];
        msgs.push(detUser===detCorrect ? {ok:true, text:`Determinante correcto (${detCorrect}).`} : {ok:false, text:`Determinante incorrecto. Correcto: ${detCorrect}.`});

        // Resolver sistema A x = b -> A=[[2,3],[1,4]] b=[7,9]
        // Resolver con Cramer o inversa:
        const a=2,b=3,c=1,d=4,e=7,f=9;
        const det = a*d - b*c;
        let x1 = (e*d - b*f)/det;
        let x2 = (a*f - e*c)/det;
        const solInput = document.querySelector(opts.inputs.sol).value.split(',').map(s=>parseFloat(s.trim()));
        if(solInput.length===2 && approxEqual(solInput[0], x1) && approxEqual(solInput[1], x2)) msgs.push({ok:true,text:`Solución correcta: x1=${round(x1)}, x2=${round(x2)}.`});
        else msgs.push({ok:false, text:`Solución incorrecta. Correcta: x1=${round(x1)}, x2=${round(x2)}.`});

        // span check: v=(5,8) solve A * alpha = v? Actually check columns span.
        // columns col1=[2,1], col2=[3,4]. We want alpha*col1 + beta*col2 = v => system:
        // 2α + 3β = 5
        // 1α + 4β = 8
        // solve:
        const D = 2*4 - 3*1;
        const alpha = (5*4 - 3*8)/D;
        const beta = (2*8 - 5*1)/D;
        const spanVal = document.querySelector(opts.inputs.span).value.trim().toLowerCase();
        // accept forms: "si α,β" or "no"
        if(spanVal.startsWith('si') || spanVal.startsWith('s')){
          // try to parse numbers after si
          const nums = spanVal.replace(/si/i,'').trim().split(/[, ]+/).map(s=>parseFloat(s)).filter(x=>!isNaN(x));
          if(nums.length>=2 && approxEqual(nums[0],alpha) && approxEqual(nums[1],beta)) msgs.push({ok:true, text:`v está en el span con α=${round(alpha)}, β=${round(beta)}.`});
          else msgs.push({ok:false, text:`Entrada para span incorrecta. Correcto: si ${round(alpha)}, ${round(beta)}.`});
        } else {
          // user answered 'no' -> wrong
          msgs.push({ok:false, text:`v sí pertenece al span. Correcto: α=${round(alpha)}, β=${round(beta)}.`});
        }

        showFeedback(fb, msgs);
      });
    }

    if(id === 3){
      const btn = document.querySelector(opts.inputs.btn);
      btn.addEventListener('click', ()=>{
        const fb = document.querySelector(opts.inputs.feedback);
        const dotUser = parseFloat(document.querySelector(opts.inputs.dot).value);
        const indUser = document.querySelector(opts.inputs.ind).value.trim().toLowerCase();
        const combUser = document.querySelector(opts.inputs.comb).value.trim().toLowerCase();

        const msgs = [];
        // u·v = (1*2 + 2*1 + 3*0) = 2+2+0 = 4
        const dotCorrect = 4;
        msgs.push(approxEqual(dotUser, dotCorrect) ? {ok:true, text:`Producto punto correcto (${dotCorrect}).`} : {ok:false, text:`Producto punto incorrecto. Correcto: ${dotCorrect}.`});

        // independence: check if u and v are linearly dependent in R^3 (they are dependent if one is scalar multiple of the other). u=(1,2,3), v=(2,1,0) -> not multiples => independent (as a set of two vectors in R^3 they are independent)
        const indepCorrect = 'si'; // two non-proportional vectors are linearly independent
        msgs.push((indUser.startsWith(indepCorrect)) ? {ok:true, text:`Correcto: u y v son linealmente independientes.`} : {ok:false, text:`Incorrecto: u y v son linealmente independientes (no son múltiplos exactos).`});

        // combination: solve α u + β v = w (w=(3,3,3))
        // system: alpha*1 + beta*2 = 3
        //         alpha*2 + beta*1 = 3
        // solve:
        // from first: alpha = 3 - 2beta
        // substitute: 2(3-2b) + b = 3 -> 6 -4b + b =3 -> -3b = -3 -> b=1 -> alpha=1
        const alpha = 1, beta = 1;
        if(combUser.startsWith('si')){
          const nums = combUser.replace(/si/i,'').trim().split(/[, ]+/).map(s=>parseFloat(s)).filter(x=>!isNaN(x));
          if(nums.length>=2 && approxEqual(nums[0],alpha) && approxEqual(nums[1],beta)) msgs.push({ok:true, text:`Correcto: w = ${alpha}u + ${beta}v.`});
          else msgs.push({ok:false, text:`Coeficientes incorrectos. Correcto: si ${alpha}, ${beta}.`});
        } else {
          msgs.push({ok:false, text:`w sí es combinación lineal: w = ${alpha}u + ${beta}v.`});
        }

        showFeedback(fb, msgs);
      });
    }
  }

  // helper
  function round(n){ return Math.round(n*1000)/1000; }

  return { initEjercicio };
})();
