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
			"isVoidElement" => $this->utils->to_boolean($component->getAttribute('is-void-element')),
			"canSetClass" => $this->utils->to_boolean($component->getAttribute('can-set-class')),
			"canSetWidth" => $this->utils->to_boolean($component->getAttribute('can-set-width')),
			"canSetHeight" => $this->utils->to_boolean($component->getAttribute('can-set-height')),
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

		return $rtn;
	}

	public function get_component($tagName){
		return $this->custom_components->{$tagName} ?? $this->system_components->{$tagName} ?? null;
	}
}
