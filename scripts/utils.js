define([], function() {
  
  return {
    LeapToScene : function(frame, positionTbl) {
      // On récupère un tableau de coordonnées normalizées
      var normalizedPosition = frame.interactionBox.normalizePoint(positionTbl, true);

      return {
        x : normalizedPosition[0] * window.innerWidth,
        y : window.innerHeight - normalizedPosition[1] * window.innerHeight,
        z : normalizedPosition[2]
      }
    }
  };

});