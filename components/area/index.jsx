import { Chart } from "@antv/g2";
import { useInterval } from "@/hooks";
import { useState, useEffect, useRef } from "react";
import classnames from "classnames";
import moment from "moment";
import { v4 as uuidv4 } from "uuid";
import styles from "./index.module.less";

const defaultData = [
  { Date: "2021-01-01", value: 120 },
  { Date: "2021-02-02", value: 150 },
  { Date: "2021-03-03", value: 250 },
  { Date: "2021-04-04", value: 500 },
  { Date: "2021-05-05", value: 620 },
  { Date: "2021-06-06", value: 500 },
];

const defaultAxisConfig = {
  x: {
    showTitle: false,
    title: "",
    range: [0, 0.99],
    color: "#20424C",
    titleStyle: {
      fill: "#E0FCFF",
      fontSize: 15,
      fontFamily: "SourceHanSansCN-Normal",
      fontWeight: "400",
    },
    labelOffset: 25,
    labelStyle: {
      fontSize: 20,
      fontWeight: "bold",
    },
    lineWidth: 3,
  },
  y: {
    showTitle: false,
    title: "货值",
    range: [0, 0.95],
    color: "#20424C",
    titleStyle: {
      fill: "#E0FCFF",
      fontSize: 15,
      fontFamily: "SourceHanSansCN-Normal",
      fontWeight: "400",
    },
    labelOffset: 18,
    labelStyle: {
      fontSize: 20,
      fontWeight: "bold",
      fontFamily: "Microsoft YaHei",
    },
    lineWidth: 3,
  },
};

const initChart = (
  {
    data = defaultData,
    multipleLines = [],
    axis = defaultAxisConfig,
    areaColor = { source: "#55FAFE", target: "#20424C" },
    padding = [8, 8, 48, 64],
    shape = { line: "line", area: "area" },
    extra = (charts) => charts,
    xScaleFormatter = (date) => moment(date).format("M月"),
  },
  id
) => {
  const chart = new Chart({
    container: id,
    autoFit: true,
    padding,
  });

  chart.scale("Date", {
    range: axis.x.range, // 右侧留白
    type: "cat",
    formatter: xScaleFormatter,
    alias: axis.x.title,
  });

  if (multipleLines.length > 0) {
    multipleLines.forEach(({ key, alias }) => {
      chart.scale({
        [key]: {
          range: axis.y.range,
          nice: true,
          sync: true,
          alias,
          formatter: (value) =>
            axis.y.formatter
              ? axis.y.formatter(value)
              : Number(value).toLocaleString(),
        },
      });
    });
  } else {
    chart.scale({
      value: {
        range: axis.y.range,
        min: 0,
        nice: true,
        sync: true,
        alias: axis.y.title,
        formatter: (value) =>
          axis.y.formatter
            ? axis.y.formatter(value)
            : Number(value).toLocaleString(),
      },
    });
  }

  chart.tooltip({
    showCrosshairs: true,
    shared: true,
  });

  if (multipleLines.length > 0) {
    // 循环绘制折线图、面积图
    multipleLines.forEach(
      ({ data: lineData, areaColor: color, key }, index) => {
        // view1 面积图 不带坐标轴
        const view1 = chart.createView({
          padding,
        });
        view1.data(lineData);
        view1.tooltip(false);
        view1.axis(false);
        view1
          .area()
          .position(`Date*${key}`)
          .color(`l(90) 0:${color.source} 1:${color.target}`)
          .style({
            fillOpacity: 0.3,
          })
          .shape(shape.area);

        // view2 折线图 带坐标轴
        const view2 = chart.createView({
          padding,
        });

        view2.data(lineData);
        if (index === 0) {
          view2.axis(key, {
            title: axis.y.showTitle
              ? {
                  style: {
                    ...axis.y.titleStyle,
                  },
                  autoRotate: false,
                }
              : null,
            tickLine: {
              style: {
                stroke: "transparent",
              },
              alignTick: true,
            },
            line: {
              style: { stroke: axis.y.color, lineWidth: axis.y.lineWidth },
            },
            grid: null,
            label: {
              offset: axis.y.labelOffset,
              style: {
                ...axis.y.labelStyle,
              },
            },
          });
          view2.axis("Date", {
            title: axis.x.showTitle
              ? {
                  style: {
                    ...axis.x.titleStyle,
                  },
                }
              : null,
            line: {
              style: { stroke: axis.x.color, lineWidth: axis.x.lineWidth },
            },
            tickLine: null,
            label: {
              offset: axis.x.labelOffset,
              style: {
                ...axis.x.labelStyle,
              },
            },
          });
        } else {
          view2.axis(false);
        }
        // 折线
        view2
          .line()
          .color(color.source)
          .position(`Date*${key}`)
          .shape(shape.line);
        // 点
        view2
          .point()
          .position(`Date*${key}`)
          .color(color.source)
          .shape("circle");
      }
    );
  } else {
    // view1 面积图 不带坐标轴
    const view1 = chart.createView({
      padding,
    });
    view1.data(data);
    view1.tooltip(false);
    view1.axis(false);
    view1
      .area()
      .position("Date*value")
      .color(`l(90) 0:${areaColor.source} 1:${areaColor.target}`)
      .style({
        fillOpacity: 0.4,
      })
      .shape(shape.area);

    // view2 折线图 带坐标轴
    const view2 = chart.createView({
      padding,
    });

    view2.data(data);
    view2.axis("value", {
      title: axis.y.showTitle
        ? {
            style: {
              ...axis.y.titleStyle,
            },
            autoRotate: false,
          }
        : null,
      tickLine: {
        style: {
          stroke: "transparent",
        },
        alignTick: true,
      },
      line: {
        style: { stroke: axis.y.color, lineWidth: axis.y.lineWidth },
      },
      grid: null,
      label: {
        offset: axis.y.labelOffset,
        style: {
          ...axis.y.labelStyle,
        },
      },
    });
    view2.axis("Date", {
      title: axis.x.showTitle
        ? {
            style: {
              ...axis.x.titleStyle,
            },
          }
        : null,
      line: {
        style: { stroke: axis.x.color, lineWidth: axis.x.lineWidth },
      },
      tickLine: null,
      label: {
        offset: axis.x.labelOffset,
        style: {
          ...axis.x.labelStyle,
        },
      },
    });
    // 折线
    view2
      .line()
      .color(areaColor.source)
      .position("Date*value")
      .shape(shape.line);
    // 点
    view2
      .point()
      .position("Date*value")
      .color(areaColor.source)
      .shape("circle");
  }

  chart.removeInteraction("legend-filter"); // 关闭图例过滤交互

  extra(chart);

  chart.render();
  return chart;
};

/**
 *
 * @param {String} props.className 容器的 className ，默认 width: 1000px;height: 350px;
 * @param {Array} props.data 图表数据，Array Item 参考： { Date: "2021-01-01", value: 120 }
 * @param {Array} props.multipleLines 多条线对应数据
 * @param {Object} props.axis 坐标轴相关配置
 * @param {Object} props.areaColor 渐变颜色，默认值：{ source: "#55FAFE", target: "#20424C" },
 * @param {Array} props.padding 容器padding，顺序为：上、右、下、左，默认值：[8, 8, 48, 64]
 * @param {Object} props.shape 折线、面积图图形形状，默认值：{ line: "line", area: "area" }
 * @param {Function} props.extra 增加额外图形，默认值：(charts)=>charts
 */

function Area(props) {
  const containerClass = classnames({
    [styles.container]: true,
    [props.className]: props.className,
  });
  const [dataIndex, setDataIndex] = useState(0);
  const containerId = uuidv4();
  const chartRef = useRef();
  // CDM
  useEffect(() => {
    const chart = initChart(props, containerId);
    chartRef.current = chart;
    return () => {
      chart.destroy();
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [props.data]);
  useInterval(() => {
    if (chartRef.current.views && chartRef.current.views.length) {
      const chart = chartRef.current.views[1];
      let current = {};
      if (props.multipleLines && props.multipleLines.length > 0) {
        const data = props.multipleLines[0].data;
        current = data[dataIndex % data.length];
      } else {
        current = props.data[dataIndex % props.data.length];
      }
      const point = chart.hideTooltip().getXY(current);
      chart.showTooltip(point);
      if (props.multipleLines && props.multipleLines.length > 0) {
        const data = props.multipleLines[0].data;
        setDataIndex((dataIndex + 1) % data.length);
      } else {
        setDataIndex((dataIndex + 1) % props.data.length);
      }
    }
  }, props.duration || 6000);
  return <div id={containerId} className={containerClass}></div>;
}

export default Area;
