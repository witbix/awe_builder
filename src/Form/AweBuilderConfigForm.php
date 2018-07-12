<?php

/**
 * @file
 * Contains  Drupal\awe_builder\Form\AweBuilderConfigForm.
 */
namespace Drupal\awe_builder\Form;


use Drupal\Core\Form\ConfigFormBase;
use Drupal\Core\Form\FormStateInterface;

class AweBuilderConfigForm extends ConfigFormBase {

  /**
   * {@inheritdoc}
   */
  protected function getEditableConfigNames() {
    return ['awe_builder.settings'];
  }

  /**
   * {@inheritdoc}
   */
  public function getFormId() {
    return 'awe_builder_config';
  }

  /**
   * {@inheritdoc}
   */
  public function buildForm(array $form, FormStateInterface $form_state) {
    $config = $this->config('awe_builder.settings');

    $form['font'] = [
      '#type' => 'fieldset',
      '#title' => $this->t('Google Font Settings'),
    ];

    $form['font']['font_description'] = [
      '#markup' => '<div>This allow you to add Google font to your website and use in admin builder.</div>
      <ul class="steps">
      <li>Go to <a href="https://fonts.google.com/" target="_blank">fonts.google.com</a>, choose your fonts.</li>
      <li>Click black panel on right bottom after choose fonts</li>
      <li>Find "Standard", copy from <strong>https://</strong> to the nearest <strong>"</strong> and paste it below to activate.</li>
      </ul>',
    ];

    $form['font']['ac_google_font'] = [
      '#type' => 'textarea',
      '#default_value' => $config->get('ac_google_font'),
      '#description' => "For example: http://fonts.googleapis.com/css?family=Open+Sans:400,700|Roboto",
      '#resizable' => FALSE,
      '#rows' => 2
    ];

    $form['font']['ac_unload_google_fonts'] = [
      '#type' => 'checkbox',
      '#title' => $this->t("Don't add fonts to my site"),
      '#description' => $this->t("Check if you want to use font on admin builder only. This will work if you've already added font through theme or other module."),
      '#default_value' => $config->get('ac_unload_google_fonts'),
    ];


    $form['media'] = array(
      '#type' => 'fieldset',
      '#title' => $this->t('Media'),
      '#weight' => 3,
      'ac_media_sub_folder' => [
        '#title' => $this->t('Media path'),
        '#description' => $this->t('Subdirectory in public file to contain file uploaded by Awecontent module.'),
        '#default_value' => $config->get('ac_media_sub_folder'),
        '#type' => 'textfield'
      ]
    );

    return parent::buildForm($form, $form_state);
  }

  /**
   * {@inheritdoc}
   */
  public function validateForm(array &$form, FormStateInterface $form_state) {
    parent::validateForm($form, $form_state);
    if ($form_state->hasValue('ac_media_sub_folder')) {
      $ac_media_sub_folder = $form_state->getValue('ac_media_sub_folder');
      $destination_dir = "public://{$ac_media_sub_folder}";
      $writable = file_prepare_directory($destination_dir, FILE_CREATE_DIRECTORY);
      if (!$writable) {
        $form_state->setErrorByName('ac_media_sub_folder', $this->t(' This may be caused by a problem with file or directory permissions. More information is available in the system log'));
      }
    }
  }

  /**
   * {@inheritdoc}
   */
  public function submitForm(array &$form, FormStateInterface $form_state) {

    parent::submitForm($form, $form_state);
    $config = $this->config('awe_builder.settings');

    if ($form_state->hasValue('ac_google_font')) {
      $config->set('ac_google_font', $form_state->getValue('ac_google_font'));
    }
    if ($form_state->hasValue('ac_unload_google_fonts')) {
      $config->set('ac_unload_google_fonts', $form_state->getValue('ac_unload_google_fonts'));
    }
    if ($form_state->hasValue('ac_media_sub_folder')) {
      $config->set('ac_media_sub_folder', $form_state->getValue('ac_media_sub_folder'));
    }
    $config->save();
  }

}