/*#if(modules.updaterAsync){#*/
//异步更新界面
let Async_Tasks = [];
let Async_TasksMap = {};
let Async_Working = 0;
let Async_Rest = 16;
/*
    Tasks={
        viewId1:{
            a:fn,
            b:[]
        },
        viewId2:{
            a:fn,
            b:[]
        }
    }
*/
//let Idle = /*G_WINDOW.requestIdleCallback ||*/ Timeout;
let Async_CheckStatus = id => {
    let task = Async_TasksMap[id];
    if (task && task['@{~task#work.index}'] >= task.length) {
        task.length = 0;
        delete Async_TasksMap[id];
        task['@{~task#done}']();
    }
};
let Async_RunTask = (last, one, task) => {
    last = Date.now();
    while (1) {
        task = Async_Tasks[0];
        if (task) {
            one = task[task['@{~task#work.index}']++];
            if (one) {
                one.f(...one.a);
            } else {
                Async_Tasks.shift();
                Async_CheckStatus(task['@{~task#vf.id}']);
            }
            if (Date.now() - last > Async_Rest) {
                Timeout(Async_RunTask);
                break;
            }
        } else {
            Async_Working = 0;
            break;
        }
    }
};
let Async_AddTask = (vf, fn, ...args) => {
    let tasks = Async_TasksMap[vf.id];
    tasks.push({
        f: fn,
        a: args
    });
    if (!Async_Working) {
        Async_Working = 1;
        Timeout(Async_RunTask);
    }
};
let Async_DeleteTask = id => {
    let tasks = Async_TasksMap[id];
    if (tasks) {
        tasks.length = 0;
        delete Async_TasksMap[id];
    }
};
let Async_SetNewTask = (vf, cb) => {
    let task, i = 0, tasks = Async_TasksMap[vf.id];
    if (tasks) {
        //console.log('clear tasks', vf.id, tasks.length);
        tasks.length = 0;
    } else {
        tasks = [];
        tasks['@{~task#priority}'] = vf['@{vframe#async.priority}'];
        tasks['@{~task#vf.id}'] = vf.id;
        for (; i < Async_Tasks.length; i++) {
            task = Async_Tasks[i];
            if (vf['@{vframe#async.priority}'] < task['@{~task#priority}']) {
                break;
            }
        }
        Async_Tasks.splice(i, 0, Async_TasksMap[vf.id] = tasks);
    }
    tasks['@{~task#done}'] = cb;
    tasks['@{~task#work.index}'] = 0;
};
/*#}#*/