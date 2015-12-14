function a(){
    var i=0;
    function b(){
        console.log(++i);
    }
    return b;
}
var c=a();
c();/**
 * Created by SZ on 2015/12/3.
 */
