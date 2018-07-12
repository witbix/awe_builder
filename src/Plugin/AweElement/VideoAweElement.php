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
 *   id = "video",
 *   title = @Translation("Video"),
 *   name = "el-video",
 *   theme = "el_video",
 * )
 */


class VideoAweElement extends AweElementBase {

  /**
   * {@inheritdoc}
   */
  public function defineLibraries() {
    $libraries = [
      'id'=>'video',
      'title' => t('Video'),
      'name' => 'el-video',
      'theme' => 'el_video',
      'jsFile' => 'assets/js/plugins/video/el-video.js',
      'jsTemplate' => 'assets/js/plugins/video/el-video.tpl.js',
      'libraries'=>array(
        'elVideoJs'=>array(
          'destination'=>array('frontend'),
          'files'=>array(
             'assets/js/plugins/video/assets/el-video.css'=>array('type'=>'css'),
             'assets/js/plugins/video/assets/front-video.js'=>array('type'=>'js')

          )
        ),
        '$.fn.magnificPopup'=>array(
          'version'=> '1.1.0',
          'destination'=>array('frontend'),
          'files'=>array(
            'assets/js/plugins/video/assets/jquery.magnific-popup.min.js'=>array('type'=>'js'),
            'assets/js/plugins/video/assets/magnific-popup.css'=>array('type'=>'css')
          )
        )
      )
    ];

    return $libraries;
  }
}