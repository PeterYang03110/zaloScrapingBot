# engine Start & Stop

## start
```shell
docker compose up
```

## stop
```shell
docker compose down
```

# First login
please check QR code image.
```shell
./jsonDataBase/CookieData/{worker name}-QR-Code.png
```

# JsonData Path

```shell
./jsonDataBase/GroupAndChannelData/{group or channel}/{name}.json
```
--- -->

# Guide
## engine start

* project root directory
```shell
docker compose up
```

## QR code scan

* Console check
* *  It have to scan QR code image in this path.
```shell
<-----------< worker-02 send QR code image >--------- 
 jsonDataBase/CookieData/{workerName-QR-Code}.png // e.g jsonDataBase/CookieData/worker-02-QR-Code.png
```
* Actions after login
* * First step: scan joined group and channel.
* * Second Step: select group or channel in order.
* * Third Step: got data in selected group or channel. if group, will get members and context, If channel, will get context.

### The process is display on the console.

## Json Data Check
```shell
/jsonDataBase/GroupAndChannelData/{group name}/{group name}.json
```
## engine stop
```shell
docker compose down
```