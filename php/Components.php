<?php
/**
 * Kaleflower
 */
namespace kaleflower;

/**
 * Kaleflower Components
 *
 * @author Tomoya Koyanagi <tomk79@gmail.com>
 */
class Components {

	/** Utility */
	private $utils;

	private $system_components;
	private $custom_components;

	/**
	 * Constructor
	 */
	public function __construct($utils){
		$this->utils = $utils;

		$this->system_components = (object) array();
		$this->custom_components = (object) array();

		// DOMDocumentのインスタンス作成
		$dom = new \DOMDocument();
		$dom->load(__DIR__.'/../data/system_components.xml');

		$xpath = new \DOMXPath($dom);
		$componentNodes = $xpath->query("/components/component");
		foreach ($componentNodes as $component) {
			$parsed_component = $this->parse_component($component);
			$component_name = $parsed_component->tagName;
			$this->system_components->{$component_name} = $parsed_component;
		}
	}

	public function add_component($component){
		$parsed_component = $this->parse_component($component);
		$component_name = $parsed_component->tagName;
		$this->custom_components->{$component_name} = $parsed_component;
		return;
	}

	private function parse_component($component){
		$component_name = $component->getAttribute('name');
		$rtn = (object) array(
			"tagName" => $component_name,
			"label" => $component->getAttribute('label') || '<'.htmlspecialchars($component_name).'>',
			"isVoidElement" => $this->utils->to_boolean($component->getAttribute('is-void-element')),
			"canSetCss" => $this->utils->to_boolean($component->getAttribute('can-set-css')),
			"canSetClass" => $this->utils->to_boolean($component->getAttribute('can-set-class')),
			"canSetWidth" => $this->utils->to_boolean($component->getAttribute('can-set-width')),
			"canSetHeight" => $this->utils->to_boolean($component->getAttribute('can-set-height')),
			"canSetContentsDirection" => $this->utils->to_boolean($component->getAttribute('can-set-contents-direction')),
			"canSetScrollable" => $this->utils->to_boolean($component->getAttribute('can-set-scrollable')),
			"canBeLayer" => $this->utils->to_boolean($component->getAttribute('can-be-layer')),
			"canSetOnClickEvent" => $this->utils->to_boolean($component->getAttribute('can-set-onclick-event')),
			'fields' => array(),
			'template' => null,
		);

		$fieldNodes = (new \DOMXPath($component->ownerDocument))->query("fields/field", $component);
		foreach ($fieldNodes as $field) {
			$field_name = $field->getAttribute('name');
			array_push($rtn->fields, (object) array(
				"name" => $field->getAttribute('name'),
				"type" => $field->getAttribute('type'),
				"label" => $field->getAttribute('label'),
				"default" => $field->getAttribute('default'),
			));
		}

		$templateNode = $component->getElementsByTagName('template')->item(0);
		$rtn->template = $templateNode->textContent ?? null;

		$styleNode = $component->getElementsByTagName('style')->item(0);
		$rtn->style = $styleNode->textContent ?? null;

		return $rtn;
	}

	public function get_system_components(){
		return $this->system_components;
	}

	public function get_custom_components(){
		return $this->custom_components;
	}

	public function get_component($tagName){
		$component = null;
		$component = $this->custom_components->{$tagName} ?? null;
		if( $component ){
			return $component;
		}
		$component = $this->system_components->{$tagName} ?? null;
		if( $component ){
			return $component;
		}
		$component = (object) array(
			"tagName" => $tagName,
			"label" => '<'.htmlspecialchars($tagName).'>',
			"isVoidElement" => false,
			"canSetClass" => true,
			"canSetWidth" => true,
			"canSetHeight" => true,
			"canSetContentsDirection" => true,
			"canSetScrollable" => true,
			"canBeLayer" => false,
			"fields" => [],
			"template" => null,
		);
		return $component;
	}
}
