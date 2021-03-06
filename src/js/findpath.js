// 是否抵达
var isArrive;
// 路径
var roadArr = []; 
// 开启队列
var openList = (function() {
  // 开启队列
  var _openArr = [];
  return {
    // 添加到队列
    add: function(point){
      _openArr.push(point);
    },
    // 计算队列长度
    count: function(){
      return _openArr.length;
    },
    // 得到开放队列中f值最小的点
    minPoint: function(){
      if (this.count() !== 1) {
        _openArr.sort(compareF);
        return _openArr[0];
      } else {
        return _openArr[0];
      }  
    },
    // 删除某个点
    removeAt: function(index) {
      _openArr.splice(index,1);
    },
    // 是否可以加入开启队列
    exists: function(obj) {
      // 是否在开启队列中
      for(i = 0; i < _openArr.length; i++) {
        if(_openArr[i].x === obj.x && _openArr[i].y === obj.y) {
          return true;
        }
      }
    },
    // 点已经在开启队列中
    foundPoint: function(tempStart, end, point) {
      var G;
      if(tempStart.x === point.x || tempStart.y === point.y) {
        G = 10;
      } else {
        G = 14;
      }
      // 如果新路径G值更低，那么设置它的父方格为当前点
      if(point.G > tempStart.G + G) {
        point.parents = tempStart;
        point.G = tempStart.G + G;
        point.F = point.G + point.H;
      }
    },
    // 点不在开启队列中,计算G、H、F值
    notFoundPoint: function(tempStart, end, point) {
      // 是否是墙体
      var isWall = true;
      // 是否在关闭队列中
      var isInCloseList = true;
      // 是否可以斜穿墙
      var isTBLF = true;
      // 是否处于边界外
      var isOut = true;

      // 是否是障碍物
      wallBlockArr.forEach(function(item, index) {
        item.forEach(function(im,idx) {
          if(im === point.x && index+1 === point.y) {
            isWall = false;
          } 
          // 是否可以斜穿墙
          else if ((point.x + 1) === im && point.y === (index + 1)) {
            wallBlockArr.forEach(function(item2, index2) {
              item2.forEach(function(im2,idx2) {
                if ((point.x === im2 && (point.y + 1) === (index2 + 1)) || 
                    (point.x === im2 && (point.y - 1) === (index2 + 1))) 
                {
                  isTBLF = false;
                }
              });
            });
          } else if ((point.x - 1) === im && point.y === (index + 1)) {
            wallBlockArr.forEach(function(item2, index2) {
              item2.forEach(function(im2,idx2) {
                if ((point.x === im2 && (point.y + 1) === (index2 + 1)) || 
                    (point.x === im2 && (point.y - 1) === (index2 + 1))) 
                {
                  isTBLF = false;
                }
              });
            });
          }      
        })
      });
      // 是否在关闭队列中
      closeList.getCloseArr().forEach(function(item, index) {
        if(item.x == point.x && item.y == point.y) {
          isInCloseList = false;
        }
      });
      // 判断点是否在边界外
      if(point.x < -1 || point.x > stage.x || point.y < -1 || point.y > stage.y) {
        isOut = false;
      }
      // 考虑该点是否可行
      if (isInCloseList && isWall && isTBLF && isOut) {
        var G,H,F;
        H = (Math.abs(end.x - point.x) + Math.abs(end.y - point.y)) * 10;
        if(tempStart.x === point.x || tempStart.y === point.y) {
          G = 10;
        } else {
          G = 14;
        }
        F = H + G; 
        point.H = H;
        point.G = G;
        point.F = F;
        point.parents = tempStart;
        _openArr.push(point);
      }
    },
    // 是否到达目标点
    get: function(end) {
      closeList.getCloseArr().forEach(function(item, index) {
        if (end.x === item.x && end.y === item.y) {
          end.parents = item.parents;
          isArrive = true;
        }
      });
    },
    // 输出开发队列
    look: function() {
      console.log(_openArr);
    },
    // 队列初始化
    init: function() {
      _openArr.splice(0, _openArr.length);
    }
  };
})();

// 比较函数
var compareF = function(a, b) {
  return a.F - b.F;
};

// 闭合队列
var closeList = (function() {
  var _closeArr = [];
  return {
    add: function(point) {
      _closeArr.push(point);
    },
    getCloseArr: function() {
      return _closeArr;
    },
    init: function() {
      _closeArr.splice(0, _closeArr.length);
    }
  };
})();

/**
 * 寻找线路方法，A*寻路算法
 * @param  
 * @param  
 * @return 坐标线路数组
 */
var findPath = function(start, end) {

  isArrive = false;
  openList.add(start);

  // 循环
  while(!isArrive)
  {
    // 找出F值最小的点
    var tempStart = openList.minPoint();
    openList.removeAt(0);
    closeList.add(tempStart);

    // 找出它相邻的点
    var aroundPoints = sAroundPoints(tempStart);

    aroundPoints.forEach(function(item, index) {
      // 是否已经在开启队列中
      if (openList.exists(item)) {
        //计算G值, 如果比原来的大, 就什么都不做, 否则设置它的父节点为当前点,并更新G和F
        openList.foundPoint(tempStart, end, item);
      } else {
        //如果它们不在开始列表里, 就加入, 并设置父节点,并计算GHF
        openList.notFoundPoint(tempStart, end, item);
      }
    });
    
    // 是否抵达终点
    openList.get(end);

  }
  foundPathRoad(end);
};

// 查找目标点的周围点
var sAroundPoints = function(tempStart) {
  var x = tempStart.x;
  var y = tempStart.y;
  return [
    {x:x-1,y:y},
    {x:x-1,y:y-1},
    {x:x-1,y:y+1},
    {x:x+1,y:y},
    {x:x+1,y:y-1},
    {x:x+1,y:y+1},
    {x:x,y:y-1},
    {x:x,y:y+1}
  ];
};

// 找回路径
var foundPathRoad = function(obj) {
  if ('parents' in obj) {
    roadArr.unshift(obj);
    arguments.callee(obj.parents);
  }
  return roadArr;
};

// 初始化寻路过程
var initFindPath = function () {
  // 清空原来路径
  roadArr.splice(0, roadArr.length);
  // 初始化开放队列
  openList.init();
  // 初始化闭合队列
  closeList.init();
}