Ext.ns('Ext.ux.touch');
/**
 * @author Shea Frederick - http://www.vinylfox.com
 * @class Ext.ux.touch.AccelerometerTabs
 * <p>A plugin that lets the user shake the device back and forth to move through tabs. No configuration is needed.</p>
 * <p>Sample Usage</p>
 * <pre><code>
 {
     xtype: 'tabpanel',
     ...,
     plugins: [new Ext.ux.touch.AccelerometerTabs()],
     ...
 }
 * </code></pre>
 */
Ext.ux.touch.AccelerometerTabs = Ext.extend(Ext.util.Observable, {
  // private
  flicked: false,
  dmcnt: 0,
  init: function(cmp){
	var me = this;
    this.cmp = cmp;
    this.setFn = (Ext.versionDetail.major === 0) ? 'Card' : 'ActiveItem'; 
    cmp.on('render', this.initAccelerometerHandlers, this);
    window.addEventListener("devicemotion", Ext.createDelegate(this.deviceMotion,this), true);
  },
  // private
  deviceMotion: function(event) {
  	if (this.dmcnt % 10 && event.acceleration){
        if ((event.acceleration.x > 10 || event.acceleration.x < -10) && !this.flicked){
          this.flicked = true;
          var ev = {
        	type: 'flick',
        	direction: (event.acceleration.x < -10)?'left':'right'
          };
          this.cmp.getActiveItem().fireEvent('devicemotion',ev);
          setTimeout(function(){
            this.flicked = false;
          },1000);
        }
    }
	me.dmcnt++;
  },
  // private
  initAccelerometerHandlers: function(){
    this.cmp.til = this.cmp.items.length-1;
    this.cmp.items.each(function(itm, i){
    	itm.addEvents({'devicemotion':true});
	    if (itm.rendered){
	      this.addAccelerometer(itm, i);
	    }else{
	      itm.on('render', function(){ 
	        this.addAccelerometer(itm, i);
	      }, this);
	    }
    },this)
  },
  // private
  addAccelerometer: function(itm, i){
    if (i === 0){
      this.addAccelerometerLeft(itm, i);
    }else if(i === this.cmp.til){
      this.addAccelerometerRight(itm, i);
    }else{
      this.addAccelerometerLeft(itm, i);
      this.addAccelerometerRight(itm, i);
    }
  },
  // private
  addAccelerometerLeft: function(itm, i){
    itm.on('devicemotion', function(ev) {
    	console.log('devicemotion:'+ev.type+':'+ev.direction);
      if (ev.type == "flick" && ev.direction == "left") {
        this.cmp['set'+this.setFn](i + 1);
      }
    }, this);
  },
  // private
  addAccelerometerRight: function(itm, i){
    itm.on('devicemotion', function(ev) {
    	console.log('devicemotion:'+ev.type+':'+ev.direction);
      if (ev.type == "flick" && ev.direction == "right") {
        this.cmp['set'+this.setFn](i - 1, {type : 'slide', direction : 'right'});
      }
    }, this);
  }
});

Ext.preg('accelerometertabs', Ext.ux.touch.AccelerometerTabs);