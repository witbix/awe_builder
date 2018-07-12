<?php

/**
 * @file
 * Contains \Drupal\awe_builder\Annotation\AweElement.
 */
namespace Drupal\awe_builder\Annotation;

use Drupal\Component\Annotation\Plugin;

/**
 * Defines a flavor item annotation object.
 *
 * Plugin Namespace: Plugin\awe_builder\flavor
 *
 * @see \Drupal\awe_builder\AweElementManager
 * @see plugin_api
 *
 * @Annotation
 */
class AweElement extends Plugin {
  /**
   * The plugin ID.
   * @var string
   */
  public $id;

  /**
   * The name of the flavor.
   * @var \Drupal\Core\Annotation\Translation
   * @ingroup plugin_translatable
   */

  public $name;

  /**
   * The price of one scoop of the flavor in dollars.
   * @var float
   */
  public $price;
}