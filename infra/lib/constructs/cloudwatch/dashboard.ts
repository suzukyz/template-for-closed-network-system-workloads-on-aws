import { aws_cloudwatch, Duration } from 'aws-cdk-lib';
import { Construct } from 'constructs';

export class Dashboard extends Construct {
  constructor(
    scope: Construct,
    id: string,
    props: {
      albFullName: string;
      ecsClusterName: string;
      ecsServiceName: string;
    }
  ) {
    super(scope, id);

    // Number of requests on ALB
    const albRequests = new aws_cloudwatch.Metric({
      namespace: 'AWS/ApplicationELB',
      metricName: 'RequestCount',
      dimensionsMap: {
        LoadBalancer: props.albFullName,
      },
      period: Duration.minutes(1),
      statistic: aws_cloudwatch.Stats.SUM,
      label: "${PROP('MetricName')} /${PROP('Period')}sec",
      unit: aws_cloudwatch.Unit.COUNT,
    });

    // CPU Usage of each ECS Tasks
    const ecsCPUUtilization = new aws_cloudwatch.Metric({
      namespace: 'AWS/ECS',
      metricName: 'CPUUtilization',
      dimensionsMap: {
        ClusterName: props.ecsClusterName,
        ServiceName: props.ecsServiceName,
      },
      period: Duration.minutes(1),
      statistic: aws_cloudwatch.Stats.AVERAGE,
      label: "${PROP('MetricName')} /${PROP('Period')}sec",
      unit: aws_cloudwatch.Unit.PERCENT,
    });

    // Create Dashboard
    const dashboard = new aws_cloudwatch.Dashboard(this, 'Dashboard', {
      dashboardName: id,
    });
    dashboard.addWidgets(
      // Requests
      new aws_cloudwatch.TextWidget({
        markdown: '# Requests',
        height: 1,
        width: 24,
      }),
      new aws_cloudwatch.GraphWidget({
        title: 'ALB Requests',
        width: 12,
        height: 6,
        stacked: false,
        left: [albRequests],
      }),
      // CPU Usage
      new aws_cloudwatch.TextWidget({
        markdown: '# CPU Usage',
        height: 1,
        width: 24,
      }),
      new aws_cloudwatch.GraphWidget({
        title: 'ECS CPU Usage',
        width: 12,
        height: 6,
        stacked: false,
        left: [ecsCPUUtilization],
      })
    );
  }
}
