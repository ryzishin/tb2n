/* ==========================================================================
   Tesla STEM · Biology 2 Notes — main.js
   General Punnett square simulator
   Modes: Mendelian monohybrid, Mendelian dihybrid, incomplete dominance,
          codominance (ABO), X-linked recessive
   Plus AOS init + active nav highlighting
   ========================================================================== */
(function () {
  'use strict';

  var REDUCED = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  /* ---------- AOS ---------- */
  if (window.AOS) {
    window.AOS.init({
      duration: 620,
      easing: 'ease-out-cubic',
      once: true,
      offset: 60,
      disable: REDUCED
    });
  }

  /* ===================================================================
     MODE DEFINITIONS
     Each mode declares:
       - name, note (HTML shown under the mode picker)
       - p1 / p2: list of selectable genotypes (key, label, alleles, optional sex)
       - square: 2 (monohybrid) or 4 (dihybrid)
       - classify(cell) -> { genoHTML, classLabel, cls, sex? }
       - outcomeNote (HTML) — shown in the carrier-note line
     =================================================================== */

  function sup(s) { return '<sup>' + s + '</sup>'; }

  /* ---------- Mendelian monohybrid ---------- */
  var MONO = {
    name: 'Mendelian Monohybrid',
    note: 'Classic dominant/recessive cross. Capital letter = dominant, lowercase = recessive. One gene, two alleles per parent.',
    size: 2,
    p1: [
      { key: 'AA', label: 'Homozygous dominant', alleles: ['A','A'] },
      { key: 'Aa', label: 'Heterozygous',         alleles: ['A','a'] },
      { key: 'aa', label: 'Homozygous recessive', alleles: ['a','a'] }
    ],
    p2: [
      { key: 'AA', label: 'Homozygous dominant', alleles: ['A','A'] },
      { key: 'Aa', label: 'Heterozygous',         alleles: ['A','a'] },
      { key: 'aa', label: 'Homozygous recessive', alleles: ['a','a'] }
    ],
    p1Sex: '♀',
    p2Sex: '♂',
    formatGeno: function (a) {
      var sorted = a.slice().sort(function (x, y) {
        return (x === x.toUpperCase() ? 0 : 1) - (y === y.toUpperCase() ? 0 : 1);
      });
      return sorted.join('');
    },
    classify: function (a1, a2) {
      var pair = [a1, a2].sort(function (x, y) {
        return (x === x.toUpperCase() ? 0 : 1) - (y === y.toUpperCase() ? 0 : 1);
      });
      var hasDominant = pair[0] === pair[0].toUpperCase();
      var bothRecessive = pair[0] === pair[0].toLowerCase() && pair[1] === pair[1].toLowerCase();
      var cls = bothRecessive ? 'normal' : (hasDominant && pair[0] !== pair[1] ? 'carrier' : 'affected');
      // For Mendelian: "affected" = shows dominant phenotype, "carrier" = heterozygote (still dominant phenotype), "normal" = homozygous recessive
      // Re-label: dominant-phenotype cells = "Dominant", heterozygote = "Hetero", recessive = "Recessive"
      if (bothRecessive) {
        return { genoHTML: pair.join(''), classLabel: 'Recessive', cls: 'normal' };
      } else if (pair[0] !== pair[1]) {
        return { genoHTML: pair.join(''), classLabel: 'Heterozygous', cls: 'carrier' };
      } else {
        return { genoHTML: pair.join(''), classLabel: 'Dominant', cls: 'affected' };
      }
    },
    outcomeNote: 'Dominant phenotype appears whenever at least one capital allele is present. The recessive phenotype only shows in the homozygous <span class="mono">aa</span> genotype.',
    parentGenoHTML: function (p) { return p.alleles.join(''); }
  };

  /* ---------- Mendelian dihybrid ---------- */
  var DI = {
    name: 'Mendelian Dihybrid',
    note: 'Two genes on different chromosomes (Law of Independent Assortment). Each heterozygote makes 4 gamete types — the square is 4×4 and the classic F<sub>2</sub> ratio is <strong>9 : 3 : 3 : 1</strong>.',
    size: 4,
    p1: [
      { key: 'RRYY',  label: 'Homozygous dominant', alleles: ['RY','RY','RY','RY'] },
      { key: 'RrYy',  label: 'Dihybrid (most tested)', alleles: ['RY','Ry','rY','ry'] },
      { key: 'rryy',  label: 'Homozygous recessive', alleles: ['ry','ry','ry','ry'] }
    ],
    p2: [
      { key: 'RRYY',  label: 'Homozygous dominant', alleles: ['RY','RY','RY','RY'] },
      { key: 'RrYy',  label: 'Dihybrid (most tested)', alleles: ['RY','Ry','rY','ry'] },
      { key: 'rryy',  label: 'Homozygous recessive', alleles: ['ry','ry','ry','ry'] }
    ],
    p1Sex: '♀',
    p2Sex: '♂',
    formatGeno: function (gametes) {
      // gametes is array of strings like 'RY'
      return gametes[0] || '';
    },
    classify: function (g1, g2) {
      // g1, g2 are 2-char strings like 'Ry'
      var r1 = g1[0], y1 = g1[1], r2 = g2[0], y2 = g2[1];
      var rDom = (r1 === 'R' || r2 === 'R');
      var yDom = (y1 === 'Y' || y2 === 'Y');
      var genoStr = (rDom ? 'R' : 'r') + (r1 === r2 ? (r1 === 'R' ? 'R' : 'r') : (r1 === 'R' ? 'Rr' : 'Rr'))
                  + (yDom ? 'Y' : 'y') + (y1 === y2 ? (y1 === 'Y' ? 'Y' : 'y') : 'Yy');
      // Simpler: just show combined genotype
      var rPair = (r1 === 'R' && r2 === 'R') ? 'RR' : (r1 === 'r' && r2 === 'r') ? 'rr' : 'Rr';
      var yPair = (y1 === 'Y' && y2 === 'Y') ? 'YY' : (y1 === 'y' && y2 === 'y') ? 'yy' : 'Yy';
      var full = rPair + yPair;
      var cls;
      var label;
      if (rDom && yDom) { cls = 'affected'; label = 'Round Yellow'; }
      else if (rDom && !yDom) { cls = 'carrier'; label = 'Round Green'; }
      else if (!rDom && yDom) { cls = 'blend'; label = 'Wrinkled Yellow'; }
      else { cls = 'normal'; label = 'Wrinkled Green'; }
      return { genoHTML: full, classLabel: label, cls: cls };
    },
    outcomeNote: 'Independent assortment produces 4 gamete types per dihybrid parent. The classic <span class="mono">RrYy × RrYy</span> cross yields <strong>9 round yellow : 3 round green : 3 wrinkled yellow : 1 wrinkled green</strong>.',
    parentGenoHTML: function (p) {
      // Reconstruct parent genotype from gametes
      var g = p.alleles[0];
      if (p.alleles.every(function (x) { return x === g; })) {
        // homozygous
        return g[0] + g[0].toLowerCase() + g[1] + g[1].toLowerCase();
      }
      return 'RrYy';
    }
  };

  /* ---------- Incomplete dominance (snapdragons) ---------- */
  var INCOMPLETE = {
    name: 'Incomplete Dominance',
    note: 'Snapdragon flowers: <span class="mono">RR</span> = red, <span class="mono">Rr</span> = pink, <span class="mono">rr</span> = white. Heterozygote is a blended intermediate phenotype.',
    size: 2,
    p1: [
      { key: 'RR', label: 'Red',   alleles: ['R','R'] },
      { key: 'Rr', label: 'Pink',  alleles: ['R','r'] },
      { key: 'rr', label: 'White', alleles: ['r','r'] }
    ],
    p2: [
      { key: 'RR', label: 'Red',   alleles: ['R','R'] },
      { key: 'Rr', label: 'Pink',  alleles: ['R','r'] },
      { key: 'rr', label: 'White', alleles: ['r','r'] }
    ],
    p1Sex: '♀',
    p2Sex: '♂',
    formatGeno: function (a) { return a.join(''); },
    classify: function (a1, a2) {
      var pair = [a1, a2].sort();
      var geno = pair.join('');
      var label, cls;
      if (geno === 'RR') { label = 'Red'; cls = 'affected'; }
      else if (geno === 'rr') { label = 'White'; cls = 'normal'; }
      else { label = 'Pink'; cls = 'blend'; }
      return { genoHTML: geno, classLabel: label, cls: cls };
    },
    outcomeNote: 'Phenotype ratio of <span class="mono">Rr × Rr</span> = <strong>1 red : 2 pink : 1 white</strong>. The heterozygote has its own visible phenotype, so genotype and phenotype ratios match (1:2:1).',
    parentGenoHTML: function (p) { return p.alleles.join(''); }
  };

  /* ---------- Codominance (ABO blood type) ---------- */
  var CODOMINANT = {
    name: 'Codominance (ABO Blood Type)',
    note: 'ABO blood type: <span class="mono">I' + sup('A') + '</span> and <span class="mono">I' + sup('B') + '</span> are codominant, both dominant over <span class="mono">i</span>. Heterozygote <span class="mono">I' + sup('A') + 'I' + sup('B') + '</span> = type AB (both antigens fully expressed).',
    size: 2,
    p1: [
      { key: 'AA', label: 'Type A (homozygous)', alleles: ['I'+sup('A'),'I'+sup('A')] },
      { key: 'AO', label: 'Type A (heterozygous)', alleles: ['I'+sup('A'),'i'] },
      { key: 'BB', label: 'Type B (homozygous)', alleles: ['I'+sup('B'),'I'+sup('B')] },
      { key: 'BO', label: 'Type B (heterozygous)', alleles: ['I'+sup('B'),'i'] },
      { key: 'AB', label: 'Type AB', alleles: ['I'+sup('A'),'I'+sup('B')] },
      { key: 'OO', label: 'Type O', alleles: ['i','i'] }
    ],
    p2: [
      { key: 'AA', label: 'Type A (homozygous)', alleles: ['I'+sup('A'),'I'+sup('A')] },
      { key: 'AO', label: 'Type A (heterozygous)', alleles: ['I'+sup('A'),'i'] },
      { key: 'BB', label: 'Type B (homozygous)', alleles: ['I'+sup('B'),'I'+sup('B')] },
      { key: 'BO', label: 'Type B (heterozygous)', alleles: ['I'+sup('B'),'i'] },
      { key: 'AB', label: 'Type AB', alleles: ['I'+sup('A'),'I'+sup('B')] },
      { key: 'OO', label: 'Type O', alleles: ['i','i'] }
    ],
    p1Sex: '♀',
    p2Sex: '♂',
    formatGeno: function (a) { return a.join(''); },
    classify: function (a1, a2) {
      var geno = [a1, a2].sort().join('');
      // Determine blood type label
      var hasA = geno.indexOf('I'+sup('A')) >= 0;
      var hasB = geno.indexOf('I'+sup('B')) >= 0;
      var label, cls;
      if (hasA && hasB) { label = 'Type AB'; cls = 'AB'; }
      else if (hasA) { label = 'Type A'; cls = 'A'; }
      else if (hasB) { label = 'Type B'; cls = 'B'; }
      else { label = 'Type O'; cls = 'O'; }
      return { genoHTML: geno, classLabel: label, cls: cls };
    },
    outcomeNote: 'Both <span class="mono">I' + sup('A') + '</span> and <span class="mono">I' + sup('B') + '</span> are expressed together — type AB is the textbook codominant phenotype. A type O parent (<span class="mono">ii</span>) can never produce a type AB child with another type O or type A/B parent.',
    parentGenoHTML: function (p) { return p.alleles.join(''); }
  };

  /* ---------- X-linked recessive ---------- */
  var XLINKED = {
    name: 'X-Linked Recessive',
    note: 'Hemophilia / colorblindness: <span class="mono">X' + sup('H') + '</span> = normal (dominant), <span class="mono">X' + sup('h') + '</span> = recessive disorder allele. The Y carries no allele. Males (XY) are hemizygous.',
    size: 2,
    p1: [
      { key: 'normal',   label: 'Normal ♀',   alleles: ['X'+sup('H'),'X'+sup('H')], sex: 'female' },
      { key: 'carrier',  label: 'Carrier ♀',  alleles: ['X'+sup('H'),'X'+sup('h')], sex: 'female' },
      { key: 'affected', label: 'Affected ♀', alleles: ['X'+sup('h'),'X'+sup('h')], sex: 'female' }
    ],
    p2: [
      { key: 'normal',   label: 'Unaffected ♂', alleles: ['X'+sup('H')], sex: 'male' },
      { key: 'affected', label: 'Affected ♂',   alleles: ['X'+sup('h')], sex: 'male' }
    ],
    p1Sex: '♀ XX',
    p2Sex: '♂ XY',
    // For X-linked, "alleles" of the mother are X^H and X^h; father's "allele" is X^H or X^h, plus a Y gamete
    formatGeno: function (a) {
      // not used directly
      return a.join('');
    },
    // Compute cells specially for X-linked
    computeXLinked: function (mAlleles, fAllele) {
      // mAlleles = ['X^H', 'X^h'] (mother gametes)
      // fAllele = 'X^H' or 'X^h' (father's X gamete); father also produces Y gametes
      var cells = [];
      // For each father gamete (X and Y), combine with each mother gamete
      var fatherGametes = [{ chr: 'X', a: fAllele }, { chr: 'Y', a: null }];
      fatherGametes.forEach(function (fg) {
        mAlleles.forEach(function (ma) {
          if (fg.chr === 'Y') {
            // Son — gets X from mom, Y from dad
            var recessive = ma.indexOf('h') >= 0; // X^h contains lowercase h
            cells.push({
              geno: ma + 'Y',
              sex: 'Son',
              cls: recessive ? 'affected' : 'normal',
              classLabel: recessive ? 'Affected' : 'Normal'
            });
          } else {
            // Daughter — gets X from both
            var mRecessive = ma.indexOf('h') >= 0;
            var fRecessive = fg.a.indexOf('h') >= 0;
            var bothRecessive = mRecessive && fRecessive;
            var oneRecessive = mRecessive !== fRecessive;
            var cls = bothRecessive ? 'affected' : (oneRecessive ? 'carrier' : 'normal');
            var label = bothRecessive ? 'Affected' : (oneRecessive ? 'Carrier' : 'Normal');
            // Sort so dominant X comes first
            var sorted = [fg.a, ma].sort(function (x, y) {
              return (x.indexOf('h') >= 0 ? 1 : 0) - (y.indexOf('h') >= 0 ? 1 : 0);
            });
            cells.push({
              geno: sorted.join(''),
              sex: 'Daughter',
              cls: cls,
              classLabel: label
            });
          }
        });
      });
      // Top-row gametes = mother's 2 alleles; left-column gametes = father's 2 gametes (X^_, Y)
      return {
        topGametes: mAlleles,
        sideGametes: fatherGametes.map(function (g) {
          return g.chr === 'Y' ? 'Y' : g.a;
        }),
          cells: cells
      };
    },
    outcomeNote: 'Males are hemizygous for the X — one recessive allele is enough to cause disease, which is why X-linked recessive disorders appear far more often in boys. A carrier female (<span class="mono">X' + sup('H') + 'X' + sup('h') + '</span>) shows no symptoms but has a <strong>50%</strong> chance of passing the recessive X to each child. Fathers can never pass an X-linked trait to a son — they give sons a Y, not an X.',
    parentGenoHTML: function (p) {
      if (p.sex === 'female') {
        var sorted = p.alleles.slice().sort(function (x, y) {
          return (x.indexOf('h') >= 0 ? 1 : 0) - (y.indexOf('h') >= 0 ? 1 : 0);
        });
        return sorted.join('');
      }
      return p.alleles[0] + 'Y';
    }
  };

  var MODES = {
    mono: MONO,
    di: DI,
    incomplete: INCOMPLETE,
    codominant: CODOMINANT,
    xlinked: XLINKED
  };

  var XLINKED_INTERPRETATIONS = {
    'normal|normal':     'Both parents are unaffected and neither carries the recessive allele — every child is fully normal.',
    'carrier|normal':    'The classic exam cross. The carrier mother passes her recessive X to half of her children: half of the sons are affected and half of the daughters become silent carriers — 25% affected · 25% carriers · 50% normal overall.',
    'affected|normal':   'An affected mother passes her recessive X to every single child: all daughters are carriers and all sons are affected. No child is completely free of the allele.',
    'normal|affected':   'Criss-cross inheritance. The affected father passes his recessive X to all of his daughters — they become carriers — but he gives his sons a Y, so no child is affected.',
    'carrier|affected':  'The severe cross. Half of all offspring are affected — including the rare affected daughter (homozygous recessive). A quarter are carriers and a quarter are fully normal.',
    'affected|affected': 'The recessive allele sits on every X chromosome in this cross — every possible child would be affected.'
  };

  var state = { mode: 'mono', p1: 'Aa', p2: 'Aa', hasRun: false };

  /* ---------- DOM ---------- */
  function $(id) { return document.getElementById(id); }
  var p1Picker = $('p1Picker');
  var p2Picker = $('p2Picker');
  var punnettEl = $('punnett');
  var statRow = $('statRow');
  var sentenceEl = $('outcomeSentence');
  var sexEl = $('sexBreakdown');
  var traitNoteEl = $('traitNote');
  var crossTitleEl = $('crossTitle');
  var simShell = $('simShell');
  var p1SexEl = $('p1Sex');
  var p2SexEl = $('p2Sex');
  var p1HintEl = $('p1Hint');
  var p2HintEl = $('p2Hint');
  var squareNoteEl = $('squareNote');
  var carrierNoteEl = $('carrierNote');

  /* ---------- Helpers ---------- */
  function getMode() { return MODES[state.mode]; }

  function getP1() {
    var m = getMode();
    return m.p1.filter(function (p) { return p.key === state.p1; })[0] || m.p1[0];
  }
  function getP2() {
    var m = getMode();
    return m.p2.filter(function (p) { return p.key === state.p2; })[0] || m.p2[0];
  }

  /* ---------- Cross engine ---------- */
  function computeCross() {
    var m = getMode();
    var p1 = getP1();
    var p2 = getP2();

    if (state.mode === 'xlinked') {
      // Special handling
      // p1 = mother (female), p2 = father (male)
      var mAlleles = p1.alleles; // e.g. ['X^H', 'X^h']
      var fAllele = p2.alleles[0]; // e.g. 'X^H' or 'X^h'
      var data = m.computeXLinked(mAlleles, fAllele);
      return {
        size: 2,
        topGametes: data.topGametes,
        sideGametes: data.sideGametes,
        cells: data.cells
      };
    }

    var size = m.size;
    var p1Gametes, p2Gametes;

    if (size === 2) {
      // Monohybrid — each parent contributes one of 2 alleles
      p1Gametes = p1.alleles;
      p2Gametes = p2.alleles;
    } else {
      // Dihybrid — each parent contributes 4 gamete combinations
      p1Gametes = p1.alleles;
      p2Gametes = p2.alleles;
    }

    var cells = [];
    p2Gametes.forEach(function (g2) {
      p1Gametes.forEach(function (g1) {
        var result = m.classify(g1, g2);
        cells.push({
          geno: result.genoHTML,
          classLabel: result.classLabel,
          cls: result.cls,
          sex: null
        });
      });
    });

    return {
      size: size,
      topGametes: p1Gametes,
      sideGametes: p2Gametes,
      cells: cells
    };
  }

  /* ---------- Rendering ---------- */
  function renderTraitNote() {
    var m = getMode();
    traitNoteEl.innerHTML = m.note;
    p1SexEl.textContent = m.p1Sex;
    p2SexEl.textContent = m.p2Sex;

    // Hints
    if (state.mode === 'mono') {
      p1HintEl.innerHTML = 'Phenotype: <span class="mono">A_</span> = dominant trait · <span class="mono">aa</span> = recessive trait';
      p2HintEl.innerHTML = 'Phenotype: <span class="mono">A_</span> = dominant trait · <span class="mono">aa</span> = recessive trait';
    } else if (state.mode === 'di') {
      p1HintEl.innerHTML = 'Gametes from <span class="mono">RrYy</span>: <span class="mono">RY · Ry · rY · ry</span>';
      p2HintEl.innerHTML = 'Gametes from <span class="mono">RrYy</span>: <span class="mono">RY · Ry · rY · ry</span>';
    } else if (state.mode === 'incomplete') {
      p1HintEl.innerHTML = 'Phenotype: <span class="mono">RR</span> red · <span class="mono">Rr</span> pink · <span class="mono">rr</span> white';
      p2HintEl.innerHTML = 'Phenotype: <span class="mono">RR</span> red · <span class="mono">Rr</span> pink · <span class="mono">rr</span> white';
    } else if (state.mode === 'codominant') {
      p1HintEl.innerHTML = 'Phenotype: A antigen → Type A · B antigen → Type B · both → Type AB · neither → Type O';
      p2HintEl.innerHTML = 'Phenotype: A antigen → Type A · B antigen → Type B · both → Type AB · neither → Type O';
    } else if (state.mode === 'xlinked') {
      p1HintEl.innerHTML = 'Mother (XX) — can be normal, carrier, or affected';
      p2HintEl.innerHTML = 'Father (XY) — can be unaffected or affected; passes Y to sons';
    }
  }

  function renderPickers() {
    var m = getMode();

    p1Picker.innerHTML = m.p1.map(function (p) {
      var active = state.p1 === p.key;
      var genoHTML = m.parentGenoHTML(p);
      return '<button type="button" class="pick' + (active ? ' is-active' : '') + '" ' +
        'data-role="p1" data-key="' + p.key + '" aria-pressed="' + active + '">' +
        '<span class="pick-geno">' + genoHTML + '</span>' +
        '<span class="pick-label">' + p.label + '</span></button>';
    }).join('');

    p2Picker.innerHTML = m.p2.map(function (p) {
      var active = state.p2 === p.key;
      var genoHTML = m.parentGenoHTML(p);
      return '<button type="button" class="pick' + (active ? ' is-active' : '') + '" ' +
        'data-role="p2" data-key="' + p.key + '" aria-pressed="' + active + '">' +
        '<span class="pick-geno">' + genoHTML + '</span>' +
        '<span class="pick-label">' + p.label + '</span></button>';
    }).join('');
  }

  function renderTitle() {
    var m = getMode();
    var p1 = getP1();
    var p2 = getP2();
    var p1Str = m.parentGenoHTML(p1);
    var p2Str = m.parentGenoHTML(p2);
    crossTitleEl.innerHTML = p1Str + ' ' + m.p1Sex + ' &nbsp;×&nbsp; ' + p2Str + ' ' + m.p2Sex;
  }

  function renderSquare(data) {
    var size = data.size;
    var html = '<div class="corner" aria-hidden="true">×</div>';
    var i, j, idx = 0;

    // Top row: mother/parent-1 gametes
    for (i = 0; i < size; i++) {
      html += '<div class="gamete" style="--d:' + (i * 60) + 'ms">' + data.topGametes[i] + '</div>';
    }

    // Body: for each parent-2 gamete, render side label + size cells
    for (j = 0; j < size; j++) {
      html += '<div class="gamete gamete-side" style="--d:' + (j * 60) + 'ms">' + data.sideGametes[j] + '</div>';
      for (i = 0; i < size; i++) {
        var c = data.cells[idx++];
        html += '<div class="cell cell-' + c.cls + '" style="--d:' + (120 + idx * 60) + 'ms">' +
          '<p class="cell-geno">' + c.geno + '</p>' +
          (c.sex ? '<p class="cell-sex">' + c.sex + '</p>' : '') +
          '<p class="cell-class">' + c.classLabel + '</p>' +
          '</div>';
      }
    }

    punnettEl.className = 'punnett size-' + size;
    punnettEl.innerHTML = html;
  }

  function countUp(el, target) {
    if (REDUCED) { el.textContent = target; return; }
    var t0 = null, dur = 650;
    function step(t) {
      if (t0 === null) t0 = t;
      var p = Math.min((t - t0) / dur, 1);
      var eased = 1 - Math.pow(1 - p, 3);
      el.textContent = Math.round(eased * target);
      if (p < 1) window.requestAnimationFrame(step);
    }
    window.requestAnimationFrame(step);
  }

  function groupChips(list) {
    var order = [];
    var map = {};
    list.forEach(function (c) {
      var k = c.geno + '|' + c.cls + '|' + c.classLabel;
      if (!map[k]) { map[k] = { geno: c.geno, cls: c.cls, label: c.classLabel, n: 0 }; order.push(k); }
      map[k].n++;
    });
    return order.map(function (k) { return map[k]; });
  }

  function sexPanel(title, list, total) {
    var chips = groupChips(list).map(function (g) {
      return '<span class="gno gno-' + g.cls + '">' + g.geno + ' · ' +
        g.label + (g.n > 1 ? ' ×' + g.n : '') + '</span>';
    }).join('');
    var pct = Math.round(list.length / total * 100);
    return '<div class="sex-panel"><p class="sex-title">' + title +
      '<span>' + list.length + ' of ' + total + ' · ' + pct + '%</span></p>' +
      '<div class="gno-chips">' + chips + '</div></div>';
  }

  function renderOutcome(data) {
    var total = data.cells.length;
    var groups = {};
    var groupOrder = [];
    data.cells.forEach(function (c) {
      var k = c.cls + '|' + c.classLabel;
      if (!groups[k]) { groups[k] = { cls: c.cls, label: c.classLabel, n: 0 }; groupOrder.push(k); }
      groups[k].n++;
    });

    // Choose display classes — for X-linked we use affected/carrier/normal;
    // for others we render one stat per phenotype
    statRow.innerHTML = groupOrder.map(function (k) {
      var g = groups[k];
      var pct = Math.round(g.n / total * 100);
      return '<div class="stat stat-' + g.cls + (g.n === 0 ? ' is-zero' : '') + '">' +
        '<p class="stat-label"><span class="dot dot-' + (g.cls === 'blend' ? 'carrier' : g.cls === 'A' ? 'affected' : g.cls === 'B' ? 'carrier' : g.cls === 'AB' ? 'affected' : g.cls === 'O' ? 'normal' : g.cls) + '"></span>' + g.label + '</p>' +
        '<p class="stat-pct"><span class="stat-num" data-target="' + pct + '">0</span><span class="stat-sign">%</span></p>' +
        '<p class="stat-count">' + g.n + ' of ' + total + ' possible offspring</p>' +
        '<div class="bar"><span class="bar-fill" data-w="' + pct + '"></span></div>' +
        '</div>';
    }).join('');

    // Restructure stat row layout to fit variable number of stats
    var statCount = groupOrder.length;
    statRow.style.gridTemplateColumns = 'repeat(' + Math.min(statCount, 4) + ', 1fr)';

    // Outcome sentence — for X-linked use the canned interpretations; otherwise generate one
    if (state.mode === 'xlinked') {
      var key = state.p1 + '|' + state.p2;
      sentenceEl.innerHTML = XLINKED_INTERPRETATIONS[key] || '';
      // Sex breakdown panels
      var daughters = data.cells.filter(function (c) { return c.sex === 'Daughter'; });
      var sons = data.cells.filter(function (c) { return c.sex === 'Son'; });
      sexEl.innerHTML = sexPanel('Daughters ♀', daughters, total) + sexPanel('Sons ♂', sons, total);
      sexEl.style.display = '';
    } else {
      // Build a generic sentence summarizing the phenotype ratio
      var ratioParts = groupOrder.map(function (k) {
        var g = groups[k];
        return g.n + ' ' + g.label;
      });
      var ratioStr = ratioParts.join(' : ');
      sentenceEl.innerHTML = 'Phenotype ratio — <strong>' + ratioStr + '</strong> (out of ' + total + ' possible offspring). Each cell represents an equal-probability outcome of one fertilization event.';
      sexEl.innerHTML = '';
      sexEl.style.display = 'none';
    }

    // Carrier note
    carrierNoteEl.innerHTML = getMode().outcomeNote;

    // Animate
    window.requestAnimationFrame(function () {
      window.requestAnimationFrame(function () {
        statRow.querySelectorAll('.stat-num').forEach(function (el) {
          countUp(el, parseInt(el.getAttribute('data-target'), 10));
        });
        statRow.querySelectorAll('.bar-fill').forEach(function (el) {
          el.style.width = el.getAttribute('data-w') + '%';
        });
      });
    });
  }

  function run() {
    state.hasRun = true;
    var data = computeCross();
    renderTitle();
    renderSquare(data);
    renderOutcome(data);
  }

  /* ---------- Events ---------- */
  document.addEventListener('click', function (e) {
    var seg = e.target.closest('.seg-btn');
    if (seg) {
      state.mode = seg.getAttribute('data-mode');
      // Reset parent selections to sensible defaults for the new mode
      var m = getMode();
      state.p1 = m.p1[Math.min(1, m.p1.length - 1)].key; // default to heterozygote if available
      state.p2 = m.p2[Math.min(1, m.p2.length - 1)].key;
      // Special defaults
      if (state.mode === 'xlinked') {
        state.p1 = 'carrier';
        state.p2 = 'normal';
      } else if (state.mode === 'codominant') {
        state.p1 = 'AO';
        state.p2 = 'BO';
      } else if (state.mode === 'incomplete') {
        state.p1 = 'Rr';
        state.p2 = 'Rr';
      } else if (state.mode === 'di') {
        state.p1 = 'RrYy';
        state.p2 = 'RrYy';
      }
      document.querySelectorAll('.seg-btn').forEach(function (b) {
        var active = b === seg;
        b.classList.toggle('is-active', active);
        b.setAttribute('aria-pressed', active);
      });
      renderTraitNote();
      renderPickers();
      run();
      return;
    }

    var pick = e.target.closest('.pick');
    if (pick) {
      state[pick.getAttribute('data-role')] = pick.getAttribute('data-key');
      renderPickers();
      run();
    }
  });

  /* Auto-run the classic cross (carrier ♀ × normal ♂) the first
     time the simulator scrolls into view. Disconnect after firing so
     we never re-run on scroll-back. Use a low threshold + rootMargin
     so it fires even when the sticky header partially covers the sim. */
  if (simShell && 'IntersectionObserver' in window) {
    var io = new IntersectionObserver(function (entries) {
      entries.forEach(function (en) {
        if (en.isIntersecting && !state.hasRun) {
          window.setTimeout(run, 300);
          io.disconnect();
        }
      });
    }, { threshold: 0.05, rootMargin: '-80px 0px 0px 0px' });
    io.observe(simShell);

    /* Fallback 1: if user navigated directly to #simulator, content-visibility
       may delay layout. Just run after 1.2s if the hash matches. */
    if (window.location.hash === '#simulator') {
      window.setTimeout(function () {
        if (!state.hasRun) run();
      }, 1200);
    }

    /* Fallback 2: general safety net for slow IO */
    window.setTimeout(function () {
      if (!state.hasRun) run();
    }, 3000);
  } else {
    run();
  }

  /* ---------- Initial render ---------- */
  renderTraitNote();
  renderPickers();

  /* ---------- Mobile nav toggle ---------- */
  var navToggle = document.querySelector('.nav-toggle');
  var siteNav = document.querySelector('.site-nav');

  if (navToggle && siteNav) {
    navToggle.addEventListener('click', function () {
      var isOpen = siteNav.classList.toggle('is-open');
      navToggle.setAttribute('aria-expanded', isOpen);
    });

    /* Close nav after clicking any link (mobile) */
    siteNav.addEventListener('click', function (e) {
      if (e.target.tagName === 'A') {
        siteNav.classList.remove('is-open');
        navToggle.setAttribute('aria-expanded', 'false');
      }
    });

    /* Close nav on Escape (keyboard) */
    document.addEventListener('keydown', function (e) {
      if (e.key === 'Escape' && siteNav.classList.contains('is-open')) {
        siteNav.classList.remove('is-open');
        navToggle.setAttribute('aria-expanded', 'false');
        navToggle.focus();
      }
    });

    /* Reset mobile nav state when resizing up to desktop */
    var resizeTimer = null;
    window.addEventListener('resize', function () {
      if (resizeTimer) clearTimeout(resizeTimer);
      resizeTimer = window.setTimeout(function () {
        if (window.innerWidth > 720) {
          siteNav.classList.remove('is-open');
          navToggle.setAttribute('aria-expanded', 'false');
        }
      }, 150);
    }, { passive: true });
  }

  /* ---------- Active nav highlighting (IntersectionObserver, no scroll listener) ---------- */
  var navLinks = Array.prototype.slice.call(document.querySelectorAll('.site-nav a'));
  if ('IntersectionObserver' in window && navLinks.length) {
    var io2 = new IntersectionObserver(function (entries) {
      entries.forEach(function (en) {
        if (en.isIntersecting) {
          var id = '#' + en.target.id;
          navLinks.forEach(function (l) {
            l.classList.toggle('is-active', l.getAttribute('href') === id);
          });
        }
      });
    }, { rootMargin: '-40% 0px -55% 0px' });
    document.querySelectorAll('main section[id]').forEach(function (s) { io2.observe(s); });
  }
})();
