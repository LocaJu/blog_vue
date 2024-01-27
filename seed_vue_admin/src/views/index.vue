<template>
  <div class="app-container home" style="min-width: 1600px">
    <el-row :gutter="20" style="height: 100%">
      <el-col :span="17">
        <!-- <el-row :gutter="20">
          <el-col :span="14">
            <el-card>
              <div slot="header"><span class="son_title">登录信息</span></div>
              <div>
                <span class="label">
                  <svg-icon icon-class="user" />
                  登录人：
                </span>
                <span class="value">{{ userInfo.userName }}</span>
              </div>
              <div>
                <span class="label">
                  <i class="ip">ip</i>
                  登录地址：
                </span>
                <span class="value">{{ userInfo.loginIp }}</span>
              </div>
              <div>
                <span class="label">
                  <svg-icon icon-class="phone" />
                  登录号码：
                </span>
                <span class="value">{{ userInfo.phonenumber }}</span>
              </div>
              <div>
                <span class="label">
                  <svg-icon icon-class="peoples" />
                  登录角色：
                </span>
                <span class="value">{{ userInfo.nickName }}</span>
              </div>
              <div>
                <span class="label">
                  <svg-icon icon-class="email" />
                  登录邮箱：
                </span>
                <span class="value">{{ userInfo.email }}</span>
              </div>
            </el-card>
          </el-col>
          <el-col :span="10">
            <timeComponent />
          </el-col>
        </el-row>
        <h3 class="content_title">基本监控</h3> -->
        <!-- cup 内存占用图表 -->
        <el-row :gutter="20" style="height: 320px">
          <el-col :span="14">
            <el-card class="mb">
              <div slot="header">
                <span class="son_title">CPU占用率</span>
              </div>
              <div id="chartCpu" style="width: 100%; height: 320px"></div>
            </el-card>
          </el-col>
          <el-col :span="10" class="mb">
            <el-card>
              <div slot="header"><span class="son_title">磁盘容量</span></div>
              <div id="chartDisk" style="width: 100%; height: 320px"></div>
            </el-card>
          </el-col>
        </el-row>
        <el-row :gutter="20" style="height: 320px">
          <el-col :span="24">
            <el-card>
              <div slot="header">
                <span class="son_title">JVM占用率</span>
              </div>
              <div id="jvmMemory" style="width: 100%; height: 310px"></div>
            </el-card>
          </el-col>
          <!-- <el-col :span="10">
            <el-card>
              <div slot="header">
                <span class="son_title">内存占用率</span>
              </div>
              <div id="systemMemory" style="width: 100%; height: 320px"></div>
            </el-card>
          </el-col> -->
        </el-row>
        <!-- <el-row>
          <h3 class="content_title" style="padding-top: 50px">调度信息</h3>
        </el-row> -->

        <!-- <el-row :gutter="20" style="height: 350px">
          <el-col :span="14">
            <el-card>
              <div slot="header"><span class="son_title">调度趋势</span></div>
              <div
                id="scheduleLineChart"
                style="width: 100%; height: 320px"
              ></div>
            </el-card>
          </el-col>
          <el-col :span="10">
            <el-card>
              <div slot="header"><span class="son_title">调度统计</span></div>
              <div
                id="schedulePieChart"
                style="width: 100%; height: 320px"
              ></div>
            </el-card>
          </el-col>
        </el-row> -->
      </el-col>
      <el-col :span="7">
        <!-- <div class="grid-content">
          <h3 class="content_title">运行任务</h3>
          <ul
            class="infinite-list"
            v-infinite-scroll="load"
            style="overflow-y: auto; height: 640px"
          >
            <li class="infinite-list-item" v-for="i in dataList" :key="i.id">
              <el-card style="margin-bottom: 16px">
                <el-descriptions :column="2">
                  <el-descriptions-item label="序号">{{
                    i.num
                  }}</el-descriptions-item>
                  <el-descriptions-item label="任务ID">{{
                    i.id
                  }}</el-descriptions-item>
                  <el-descriptions-item label="任务名称" :span="2">{{
                    i.jobDesc
                  }}</el-descriptions-item>
                  <el-descriptions-item label="最近执行时间" :span="2">{{
                    i.triggerLastTimeStr
                  }}</el-descriptions-item>
                  <el-descriptions-item label="下次执行时间" :span="2">{{
                    i.triggerNextTimeStr
                  }}</el-descriptions-item>
                </el-descriptions>
              </el-card>
            </li>
          </ul>
        </div> -->
        <!-- <timeComponent /> -->
        <el-card class="mb">
          <div style="margin-bottom: 12px">监控信息</div>
          <div>
            <span class="label">cpu核心数：</span>
            <span class="value">{{ monitorInfo.cpuCore }}</span>
          </div>
          <div class="flex">
            <span class="label">数据库连接状况：</span>
            <svg-icon
              v-if="monitorInfo.database === 'UP'"
              icon-class="success"
              style="font-size: 20px"
            />
            <svg-icon
              v-else
              icon-class="successDisabled"
              style="font-size: 20px"
            />
          </div>
          <div class="flex">
            <span class="label">redis连接状况：</span>
            <svg-icon
              v-if="monitorInfo.redis === 'UP'"
              icon-class="success"
              style="font-size: 20px"
            />
            <svg-icon
              v-else
              icon-class="successDisabled"
              style="font-size: 20px"
            />
          </div>
        </el-card>
        <el-card>
          <div slot="header">
            <span class="son_title">内存占用率</span>
          </div>
          <div id="systemMemory" style="width: 100%; height: 558px"></div>
        </el-card>
      </el-col>
    </el-row>
  </div>
</template>

<script>
import SockJS from "sockjs-client";
import Stomp from "stompjs";
import dayjs from "dayjs";
import echarts from "echarts";
export default {
  name: "Index",
  data() {
    return {
      stompClient: "",
      timer: "",
      userInfo: JSON.parse(sessionStorage.getItem("userInfo")),
      monitorInfo: {}, // 监控信息

      // 分页请求数据
      dataList: [],
      // 接收chart，用于页面切换后释放内存
      cpuChart: null,
      diskChart: null,
      jvmMemoryChart: null,
      memoryChart: null,
      scheduleLineChart: null,
      schedulePieChart: null,
      cpuData: [],
      diskData: [],
      jvmMemoryData: [],
      memoryData: [],
      scheduleLineData: [],
      schedulePieData: [],
      // CPU 、内存占用率 配置属性
      optionCpu: {
        legend: {
          data: ["System CPU", "JVM CPU"],
        },
        tooltip: {
          trigger: "axis",
          backgroundColor: "#ffffff",
          textStyle: {
            color: "black", //设置文字颜色
          },
          borderColor: "#c2c0bf", //设置边框颜色
          borderWidth: 1,
          extraCssText: "box-shadow: 0 0 5px #c2c0bf",
          formatter: (params) => {
            const system =
              params.find((p) => p.seriesName === "System CPU")?.data ?? [];
            const jvm =
              params.find((p) => p.seriesName === "JVM CPU")?.data ?? [];
            const style =
              "display:inline-block;width:10px;height:10px;border-radius:50%;margin-right:4px;";
            const pointDate = `<span>${dayjs(system[0]).format(
              "HH:mm:ss"
            )}</span><br />`;
            const pointSys = system[1]
              ? `<span><i style="${style}background:#58D9F9;"></i>System CPU:${system[1]}%</span><br />`
              : "";
            const pointJVM = jvm[1]
              ? `<span><i style="${style}background:#99CC66;"></i>JVM CPU:${jvm[1]}%</span>`
              : "";
            return `${pointDate}${pointSys}${pointJVM}`;
          },
        },
        xAxis: {
          type: "category",
          splitLine: "true",
          boundaryGap: false,
        },
        yAxis: {
          type: "value",
          axisLabel: {
            formatter: "{value}%",
          },
        },
        series: [
          {
            name: "System CPU",
            data: [],
            type: "line",
            smooth: true,
            showSymbol: false,
            label: {
              position: "top",
              textStyle: {
                fontSize: 14,
              },
            },
            itemStyle: {
              normal: { color: "#58D9F9", lineStyle: { color: "#58D9F9" } },
            },
            areaStyle: {
              color: "#58D9F9",
              opacity: 0.5,
            },
          },
          {
            name: "JVM CPU",
            data: [],
            type: "line",
            label: {
              position: "top",
              textStyle: {
                fontSize: 14,
              },
            },
            smooth: true,
            showSymbol: false,
            itemStyle: {
              normal: { color: "#99CC66", lineStyle: { color: "#99CC66" } },
            },
            areaStyle: {
              color: "#99CC66",
              opacity: 0.5,
            },
            markArea: {
              silent: true,
              itemStyle: {
                opacity: 0.3,
              },
            },
          },
        ],
      },
      // 磁盘占用率   属性
      optionDisk: {
        tooltip: {
          trigger: "item",
          formatter: (params) => {
            const name = `<span>${params.seriesName}</span><br/>`;
            const marker = params.marker;
            const seriesName = `<span>${params.name}: ${params.value}GB</span><br />`;
            return `${name}${marker}${seriesName}`;
          },
        },
        legend: {
          orient: "vertical",
          left: "left",
        },
        color: ["#91cc75", "#ee6666"],
        series: [
          {
            name: "磁盘容量",
            type: "pie",
            avoidLabelOverlap: false,
            radius: ["40%", "70%"],
            itemStyle: {
              borderRadius: 10,
              borderColor: "#fff",
              borderWidth: 2,
            },
            label: {
              show: false,
            },
            itemStyle: { normal: { label: { show: true, formatter: "{d}%" } } },
            data: [],
          },
        ],
      },
      // jvm
      optionJvmMemory: {
        tooltip: {
          trigger: "axis",
          backgroundColor: "#ffffff",
          textStyle: {
            color: "black", //设置文字颜色
          },
          borderColor: "#c2c0bf", //设置边框颜色
          borderWidth: 1,
          extraCssText: "box-shadow: 0 0 5px #c2c0bf",
          formatter: (params) => {
            const item1 = params.find((p) => p.seriesName === "最大内存") || {};
            const item2 =
              params.find((p) => p.seriesName === "当前使用内存") || {};

            const max = item1?.data ?? [];
            const current = item2?.data ?? [];

            const marker1 = item1?.marker;
            const marker2 = item2?.marker;

            const title = `<span>${max[0]}</span><br />`;
            const pointSys = max[1]
              ? `<span>${marker1}${item1.seriesName}: ${max[1]}GB</span><br />`
              : "";
            const pointJVM = current[1]
              ? `<span>${marker2}${item2.seriesName}: ${current[1]}GB</span>`
              : "";
            return `${title}${pointSys}${pointJVM}`;
          },
        },
        legend: {
          data: ["最大内存", "当前使用内存"],
        },
        xAxis: {
          type: "category",
          splitLine: "true",
          boundaryGap: false,
        },
        yAxis: {
          type: "value",
          axisLabel: {
            formatter: "{value} GB",
          },
        },
        series: [
          {
            name: "最大内存",
            type: "line",
            data: [],
            smooth: true,
            showSymbol: false,
            itemStyle: {
              normal: { color: "#73c0de", lineStyle: { color: "#73c0de" } },
            },
          },
          {
            name: "当前使用内存",
            type: "line",
            data: [],
            smooth: true,
            showSymbol: false,
            itemStyle: {
              normal: { color: "#fac858", lineStyle: { color: "#fac858" } },
            },
          },
        ],
      },
      optionMemory: {
        tooltip: {
          trigger: "axis",
          formatter: (params) => {
            const item1 = params.find((p) => p.seriesName === "总内存") || {};
            const item2 = params.find((p) => p.seriesName === "占用内存");
            const max = item1?.data ?? [];
            const current = item2?.data ?? [];

            const marker1 = item1?.marker;
            const marker2 = item2?.marker;

            const title = `<span>${max[0]}</span><br />`;
            const pointSys = max[1]
              ? `<span>${marker1}${item1.seriesName}: ${max[1]}GB</span><br />`
              : "";
            const pointJVM = current[1]
              ? `<span>${marker2}${item2.seriesName}: ${current[1]}GB</span>`
              : "";
            return `${title}${pointSys}${pointJVM}`;
          },
        },
        legend: {
          data: ["总内存", "占用内存"],
        },
        xAxis: {
          type: "category",
          boundaryGap: false,
        },
        yAxis: {
          type: "value",
          axisLabel: {
            formatter: "{value} GB",
          },
        },
        series: [
          {
            name: "总内存",
            type: "line",
            data: [],
            smooth: true,
            label: {
              position: "top",
              textStyle: {
                fontSize: 14,
              },
            },
            itemStyle: {
              normal: { color: "#73c0de", lineStyle: { color: "#73c0de" } },
            },
            areaStyle: {
              color: "#73c0de",
              opacity: 0.5,
            },
          },
          {
            name: "占用内存",
            type: "line",
            data: [],
            smooth: true,
            label: {
              position: "top",
              textStyle: {
                fontSize: 14,
              },
            },
            itemStyle: {
              normal: { color: "#ee6666", lineStyle: { color: "#ee6666" } },
            },
            areaStyle: {
              color: "#ee6666",
              opacity: 0.5,
            },
            markArea: {
              silent: true,
              itemStyle: {
                opacity: 0.3,
              },
            },
          },
        ],
      },
      // 调度统计折线
      optionScheduleLine: {
        legend: {
          data: ["成功", "失败", "运行中"],
        },
        toolbox: {
          feature: {},
        },
        tooltip: {
          trigger: "axis",
          backgroundColor: "#ffffff",
          textStyle: {
            color: "black", //设置文字颜色
          },
          borderColor: "#c2c0bf", //设置边框颜色
          borderWidth: 1,
          extraCssText: "box-shadow: 0 0 5px #c2c0bf",
        },
        xAxis: {
          data: [],
          axisLabel: {
            //展示角度
            rotate: 60,
          },
        },
        yAxis: {},
        series: [
          {
            name: "成功",
            data: [],
            type: "line",
            label: {
              show: true,
              position: "top",
              textStyle: {
                fontSize: 14,
              },
            },
            itemStyle: {
              normal: { color: "#58D9F9", lineStyle: { color: "#58D9F9" } },
            },
          },
          {
            name: "运行中",
            data: [],
            type: "line",
            label: {
              show: true,
              position: "top",
              textStyle: {
                fontSize: 14,
              },
            },
            itemStyle: {
              normal: { color: "#99CC66", lineStyle: { color: "#99CC66" } },
            },
          },
          {
            name: "失败",
            data: [],
            type: "line",
            label: {
              show: true,
              position: "top",
              textStyle: {
                fontSize: 14,
              },
            },
            itemStyle: {
              normal: { color: "#FFBA92", lineStyle: { color: "#FFBA92" } },
            },
          },
        ],
      },
      // 调度统计饼图
      optionSchedulePie: {
        title: {
          text: "调度统计",
          left: "center",
          top: "center",
        },
        tooltip: {
          trigger: "item",
          backgroundColor: "#ffffff",
          textStyle: {
            color: "black", //设置文字颜色
          },
          borderColor: "#c2c0bf", //设置边框颜色
          borderWidth: 1,
          extraCssText: "box-shadow: 0 0 5px #c2c0bf",
        },
        legend: {
          left: "right",
        },
        itemStyle: {
          borderRadius: 20,
          borderColor: "#fff",
          borderWidth: 1,
          shadowColor: "rgba(0,138,255,0.45)",
          shadowBlur: 8,
          shadowOffsetX: 1,
        },
        color: ["#58D9F9", "#FFBA92", "#99CC66"],
        series: [
          {
            name: "调度统计",
            type: "pie",
            data: [],
            radius: ["40%", "70%"],
            avoidLabelOverlap: true,
            itemStyle: { normal: { label: { show: true, formatter: "{d}%" } } },
          },
        ],
      },
    };
  },
  mounted() {
    this.initChart();
    this.initWebSocket();
  },
  activated() {},
  // 切出界面时清除定时器
  deactivated() {},
  created() {},
  methods: {
    load() {},
    initChart() {
      this.cpuChart = echarts.init(document.getElementById("chartCpu"));
      this.diskChart = echarts.init(document.getElementById("chartDisk"));
      this.jvmMemoryChart = echarts.init(document.getElementById("jvmMemory"));
      this.memoryChart = echarts.init(document.getElementById("systemMemory"));
    },
    initWebSocket() {
      this.connect();
    },
    connect() {
      // 创建一个有SockJs包装过的webSocket
      var socket = new SockJS(process.env.VUE_APP_BASE_API + "/websocket");
      //StompJS 简单流文本定向消息协议
      this.stompClient = Stomp.over(socket);

      let stompClient = this.stompClient;
      let that = this;
      stompClient.connect({}, function (frame) {
        stompClient.subscribe("/topic/sysInfo", function (message) {
          console.log(JSON.parse(message.body), "data");
          that.updateCharts(JSON.parse(message.body));
        });

        var subscribeInit = stompClient.subscribe(
          "/topic/sysInfoInit",
          function (message) {
            that.updateCharts(JSON.parse(message.body));
            //初始化完毕 取消订阅
            stompClient.unsubscribe(subscribeInit.id);
          }
        );
        // 发送请求获取初始数据
        stompClient.send("/app/monitor", {});
      });
    },
    updateCharts(data) {
      let that = this;
      if (Array.isArray(data)) {
        // 初始化数据
        data.forEach(function (item) {
          that.updateChartData(item, true);
        });
      } else {
        // 订阅数据
        that.updateChartData(data, false);
      }
      // CPU占用率
      this.optionCpu.series[0].data = this.cpuData?.map((item) => [
        item[0],
        item[1],
      ]);
      this.optionCpu.series[1].data = this.cpuData?.map((item) => [
        item[0],
        item[2],
      ]);

      // 磁盘占用率
      this.optionDisk.series[0].data = this.diskData;

      this.optionJvmMemory.series[0].data = this.jvmMemoryData?.map((item) => [
        item[0],
        item[1],
      ]);
      this.optionJvmMemory.series[1].data = this.jvmMemoryData?.map((item) => [
        item[0],
        item[2],
      ]);

      this.optionMemory.series[0].data = this.memoryData?.map((item) => [
        item[0],
        item[1],
      ]);
      this.optionMemory.series[1].data = this.memoryData?.map((item) => [
        item[0],
        item[2],
      ]);

      // CPU、内存占用率
      this.cpuChart.setOption(this.optionCpu);

      // 磁盘占用率
      if (this.diskData.length === 2) {
        this.diskChart.setOption(this.optionDisk);
      }

      this.jvmMemoryChart.setOption(this.optionJvmMemory);
      this.memoryChart.setOption(this.optionMemory);
    },
    updateChartData(item, isInitial) {
      var createTime = item.createTime;
      if (isInitial) {
        this.monitorInfo = item;
        if (this.diskData.length === 0) {
          this.diskData.push({ value: item.diskFreeSize, name: "剩余" });
          this.diskData.push({
            value: (item.diskTotalSize - item.diskFreeSize).toFixed(2),
            name: "已用",
          });
        }
      } else {
        this.cpuData.shift();
        this.memoryData.shift();
        this.jvmMemoryData.shift();
      }

      this.cpuData.push([createTime, item.sysCpuUsed, item.jvmCpuUsed]);
      this.memoryData.push([
        createTime,
        item.sysTotalMemory,
        Number(item.sysTotalMemory - item.sysFreeMemory).toFixed(2),
      ]);
      this.jvmMemoryData.push([
        createTime,
        item.jvmHeapMemoryMax,
        item.jvmHeapMemoryUsed,
      ]);
    },
    disconnect() {
      if (this.stompClient) {
        this.stompClient.disconnect();
      }
    },
  },
  beforeDestroy() {
    this.disconnect();
    // 清除所有图例，释放资源
    this?.cpuChart?.clear();
    this?.diskChart?.clear();
    this?.jvmMemoryChart?.clear();
    this?.memoryChart?.clear();
    clearInterval(this.timer);
  },
  watch: {},
};
</script>

<style scoped lang="scss">
.ip {
  font-weight: 600;
}
.home {
  .el-card {
    border-radius: 16px;
  }
  .label {
    font-size: 14px;
    line-height: 2;
  }
  .value {
    font-size: 14px;
    color: #606266;
    line-height: 2;
  }
}
.infinite-list {
  overflow: auto;
  padding: 0;
}

.total {
  width: 100%;
  display: flex;
  justify-content: space-between;
}

.content_title {
  color: #555658;
  font-weight: bold;
  line-height: 1em;
}

.son_title {
  font-weight: bold;
}
.mb {
  margin-bottom: 16px;
}
.flex {
  display: flex;
  align-items: center;
}
</style>
