<?php

/**
 * @file
 * Contains \Drupal\awe_builder\AweBuilder\AweBuilderUpdateHost.
 */
namespace Drupal\awe_builder\AweBuilder;


use Drupal\Component\Serialization\Json;

class AweBuilderUpdateHost {

  private $oldBaseUrl;

  private $newBaseUrl;

  private $isChange;

  public function __construct($oldBaseUrl, $newBaseUrl) {
    $this->oldBaseUrl = $oldBaseUrl;
    $this->newBaseUrl = $newBaseUrl;
    if (strtolower($this->oldBaseUrl) !== strtolower($this->newBaseUrl)) {
      $this->isChange = TRUE;
    }
    else {
      $this->isChange = FALSE;
    }
  }

  public function convertData($data) {
    if (!empty($data) && $this->isChange) {
      if(is_string($data)){
        $data = unserialize ($data, true);
      }
      if(isset($data[0]) && isset($data[0]['build_data'])){
        foreach ($data as &$item) {
          $buildData = unserialize($item['build_data']);
          $this->updateElement($buildData);
          $item['build_data'] = $buildData;
        }
      } else {
        $this->updateElement($data);
      }
    }
    return $data;
  }

  protected function updateElement(&$elements) {
    $file = [];
    if (isset($elements[0])) {
      foreach ($elements as &$element) {
        $this->updateElement($element);
      }
    }
    else {
      if (isset($elements['settings'])) {
        $settings = Json::decode($elements['settings']);
        foreach ($settings as $key => &$part) {
          // get image from style
          if (isset($part['style']) && count($part['style'])) {
            $this->updateImageStyle($part['style']);
          }
          // get image from settings
          if (isset($part['settings']) && count($part['settings'])) {
            $this->updateImageSettings($part['settings']);
          }
        }
        $elements['settings'] = Json::encode($settings);
        if (isset($elements['renderedStyle']) && isset($elements['renderedStyle']['styles']) && !empty($elements['renderedStyle']['styles'])) {
          $this->updateRenderedStyle($elements['renderedStyle']['styles']);
        }
        if (isset($elements['content'])) {
          $this->updateElement($elements['content']);
        }
      }
    }
    return $file;
  }

  protected function updateImageStyle(&$style) {
    foreach ($style as &$status) {
      if (isset($status['background']['image']) && count($status['background']['image'])) {
        $background = $status['background'];
        foreach ($background['image']['file'] as $screen => $data) {
          if ($data['fid'] > 0) {
            $status['background']['image']['file'][$screen]['url'] = str_replace($this->oldBaseUrl, $this->newBaseUrl, $data['url']);
          }
        }
      }
    }
  }

  protected function updateImageSettings(&$settings) {
    foreach ($settings as $field => &$data) {
      if (is_array($data) && !empty($data)) {
        if (isset($data['url'])) {
          if ($data['url'] != '') {
            $settings[$field]['url'] = str_replace($this->oldBaseUrl, $this->newBaseUrl, $data['url']);
          }
        }
        else {
          $this->updateImageSettings($data);
        }
      }
    }
  }

  protected function updateRenderedStyle(&$renderedStyle) {
    foreach ($renderedStyle as &$style) {
      if (isset($style['background-image']) && $style['background-image']) {
        $style['background-image'] = str_replace($this->oldBaseUrl, $this->newBaseUrl, $style['background-image']);
      }
    }
  }
  
  public function getOldBaseUrl(){
    return $this->oldBaseUrl;
  }
  
  public function getNewBaseUrl(){
    return $this->newBaseUrl;
  }
}