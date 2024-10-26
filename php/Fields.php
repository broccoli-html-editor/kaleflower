<?php
/**
 * Kaleflower
 */
namespace kaleflower;

/**
 * Kaleflower Fields
 *
 * @author Tomoya Koyanagi <tomk79@gmail.com>
 */
class Fields {

	/** Utility */
	private $utils;

	private $system_fields;
	private $custom_fields;

	/**
	 * Constructor
	 */
	public function __construct($utils){
		$this->utils = $utils;

		$this->system_fields = (object) array();
		$this->custom_fields = (object) array();

		// DOMDocumentのインスタンス作成
		$dom = new \DOMDocument();
		$dom->load(__DIR__.'/../data/system_fields.xml');

		$xpath = new \DOMXPath($dom);
		$fieldNodes = $xpath->query("/fields/field");
		foreach ($fieldNodes as $field) {
			$parsed_field = $this->parse_field($field);
			$field_name = $parsed_field->type;
			$this->system_fields->{$field_name} = $parsed_field;
		}
	}

	public function add_field($field){
		$parsed_field = $this->parse_field($field);
		$field_name = $parsed_field->type;
		$this->custom_fields->{$field_name} = $parsed_field;
		return;
	}

	private function parse_field($field){
		$field_name = $field->getAttribute('type');
		$rtn = (object) array(
			"type" => $field_name,
			'ui' => null,
		);

		$templateNode = $field->getElementsByTagName('ui')->item(0);
		$rtn->ui = $templateNode->textContent ?? null;

		return $rtn;
	}

	public function get_field($type){
		return $this->custom_fields->{$type} ?? $this->system_fields->{$type} ?? null;
	}
}
