(function(){
  'use strict';
  if(window.__bwV64ProductionBridge)return;window.__bwV64ProductionBridge=true;

  function findAnalyzeButton(){
    return Array.from(document.querySelectorAll('button')).find(function(b){
      return String(b.textContent||'').trim().toLowerCase()==='analyze stands';
    });
  }

  function wire(){
    var btn=findAnalyzeButton();
    if(!btn || btn.dataset.bwV64Wired==='1')return;
    var fresh=btn.cloneNode(true);
    fresh.dataset.bwV64Wired='1';
    fresh.type='button';
    fresh.addEventListener('click',function(e){
      e.preventDefault();
      e.stopImmediatePropagation();
      var open=window.bwOpenTodayRecommendation;
      if(typeof open==='function'){open();return;}
      var rec=window.BackwoodsRecommendation&&window.BackwoodsRecommendation.recommendation;
      if(typeof rec==='function'){
        var r=rec();
        var best=r&&r.best;
        if(best&&best.stand){
          alert('Best stand: '+(best.stand.name||'Unnamed stand')+' — '+best.score+'/100\\n'+(best.reasons||[]).join(' • '));
        }else{
          alert('Add at least one stand to analyze your hunting locations.');
        }
      }else{
        alert('Hunt Intelligence is still loading. Please try Analyze Stands again.');
      }
    });
    btn.replaceWith(fresh);
  }

  function init(){
    wire();
    var observer=new MutationObserver(wire);
    observer.observe(document.body,{childList:true,subtree:true});
    setTimeout(wire,250);
    setTimeout(wire,1000);
    setTimeout(wire,2500);
  }
  if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',init);else init();
})();
