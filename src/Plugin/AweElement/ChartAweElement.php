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
 *   id = "chart_line",
 *   title = @Translation("Chart"),
 *   name = "el_chart",
 *   theme = "el_chart_line",
 * )
 */

class ChartAweElement extends AweElementBase {

  /**
   * {@inheritdoc}
   */
  public function defineLibraries() {
    $libraries = [
      'id'=>'chart_line',
      'title' => t('Chart'),
      'name' => 'el_chart',
      'theme' => 'el_chart_line',
      'jsFile' => 'assets/js/plugins/chart/el-chart-line.js',
      'jsTemplate' => 'assets/js/plugins/chart/el-chart-line.tpl.js',
      'libraries'=>array(
        'jsClass.Chart'=>array(
          'version'=> '1.1.1',
          'destination'=>array('frontend'),
          'files'=>array(
            'assets/js/plugins/chart/assets/Chart.min.js'=>array('type'=>'js')
          )
        ),
        '$.fn.mdLineChart'=>array(
          'version'=> '1.0',
          'destination'=>array('frontend'),
          'files'=>array(
            'assets/js/plugins/chart/assets/jquery.mdLineChart.js'=>array('type'=>'js'),
            'assets/js/plugins/chart/assets/el-char-line.css'=>array('type'=>'css')
          )
        )
      )
    ];

    return $libraries;
  }
}