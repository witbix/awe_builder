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
 *   id = "drupalBlocks",
 *   title = @Translation("Block"),
 *   name = "drupalBlocks",
 *   theme = "awe_block",
 * )
 */
class BlockAweElement extends AweElementBase {

  /**
   * {@inheritdoc}
   */
  public function getLibraries() {

    $libraries = [
      'jsFile' => 'assets/js/awe-block.js',
      'jsTemplate' => 'assets/js/awe-block-template.js',
    ];

    return $libraries;
  }


}