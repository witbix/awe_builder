<?php
/**
 * @file
 * Contains \Drupal\awe_builder\Plugin\AweElement\AlertAweElement.
 */
namespace Drupal\awe_builder\Plugin\AweElement;

use Drupal\awe_builder\AweElementBase;

/**
 * Provides a 'text' AweElement.
 *
 * @AweElement(
 *   id = "chart_pie",
 *   title = @Translation("Pie Chart"),
 *   name = "el_pie_chart",
 *   theme = "el_chart_pie",
 * )
 */

class PieChartAweElement extends AweElementBase {

  /**
   * {@inheritdoc}
   */
  public function defineLibraries() {
    $libraries = [
      'id'=>'chart_pie',
      'title' => t('Pie Chart'),
      'name' => 'el_pie_chart',
      'theme' => 'el_chart_pie',
      'jsFile' => 'assets/js/plugins/pie-chart/el-chart-pie.js',
      'jsTemplate' => 'assets/js/plugins/pie-chart/el-chart-pie.tpl.js',
      'libraries'=>array(
        'jsClass.Chart'=>array(
          'version'=> '1.1.1',
          'destination'=>array('frontend'),
          'files'=>array(
            'assets/js/plugins/pie-chart/assets/Chart.min.js'=>array('type'=>'js')
          )
        ),
        '$.fn.mdPieChart'=>array(
          'version'=> '1.0',
          'destination'=>array('frontend'),
          'files'=>array(
            'assets/js/plugins/pie-chart/assets/jquery.mdPieChart.js'=>array('type'=>'js'),
            'assets/js/plugins/pie-chart/assets/el-char-pie.css'=>array('type'=>'css')
          )
        )
      )
    ];

    return $libraries;
  }
}