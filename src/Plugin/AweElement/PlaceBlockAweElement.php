<?php
/**
 * @file
 * Contains \Drupal\awe_builder\Plugin\AweElement\AlertAweElement.
 */
namespace Drupal\awe_builder\Plugin\AweElement;

use Drupal\awe_builder\AweElementBase;

/**
 * Provides a 'alert' AweElement.
 *
 * @AweElement(
 *   id = "drupalPlaceBlocks",
 *   title = @Translation("Place Block"),
 *   name = "drupalPlaceBlocks",
 *   theme = "awe_block",
 * )
 */
class PlaceBlockAweElement extends AweElementBase {

  /**
   * {@inheritdoc}
   */
  public function getLibraries() {
    $libraries = [
      'jsFile' => 'assets/js/awe-block.js',
      'jsTemplate' => 'assets/js/awe-place-template.js',
    ];

    return $libraries;
  }
}