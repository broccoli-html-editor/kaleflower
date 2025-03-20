<?php
/**
 * Kaleflower XML Parser
 */
namespace kaleflower;

/**
 * Kaleflower XML Parser
 *
 * @author Tomoya Koyanagi <tomk79@gmail.com>
 */
class kflowXml {

	/** Utility */
	private $utils;

	/** kflow XML object */
	private $dom;

	/**
	 * Constructor
	 */
	public function __construct(){
	}

	/**
	 * Get DOMDocument object
	 */
	public function getDom(){
		return $this->dom;
	}

	/**
	 * Get XML sourcecode
	 */
	public function getXml(){
		if( !$this->dom ){
			return false;
		}
		return $this->dom->saveXML();
	}

	/**
	 * Load kflow XML from file
	 * @param string $realpath_kflow Realpath of the kflow file.
	 */
	public function load( $realpath_kflow ){
		if( !is_file($realpath_kflow) || !is_readable($realpath_kflow) ){
			return false;
		}

		$dom = new \DOMDocument();
		$dom->load($realpath_kflow);

		$this->mergeDom($dom);

		return true;
	}

	/**
	 * Load kflow XML from sourcecode
	 * @param string $src_xml Sourcecode of the kflow XML Document.
	 */
	public function loadXml( $src_xml ){
		$dom = new \DOMDocument();
		$dom->loadXml($src_xml);

		$this->mergeDom($dom);

		return true;
	}

	/**
	 * Merge DOM
	 * @param object $dom DOMDocument object
	 * @return boolean Result
	 */
	private function mergeDom($dom){
		if( !$this->dom ){
			$this->dom = $dom;
			return true;
		}

		$mergeRules = array(
			array(
				'container' => 'configs',
				'contents' => 'config',
				'attrId' => 'name',
			),
			array(
				'container' => 'fields',
				'contents' => 'field',
				'attrId' => 'type',
			),
			array(
				'container' => 'components',
				'contents' => 'component',
				'attrId' => 'name',
			),
		);

		foreach($mergeRules as $mergeRule){
			// Get components from the new DOM
			$componentsNode = $dom->getElementsByTagName($mergeRule['container'])->item(0);
			if ($componentsNode) {
				// Get components from the current DOM
				$thisComponentsNode = $this->dom->getElementsByTagName($mergeRule['container'])->item(0);
				if (!$thisComponentsNode) {
					// If there's no components node in the current DOM, create one
					$thisComponentsNode = $this->dom->createElement($mergeRule['container']);
					$this->dom->documentElement->appendChild($thisComponentsNode);
				}

				// Go through each component in the new DOM
				$newComponents = $componentsNode->getElementsByTagName($mergeRule['contents']);
				for ($i = 0; $i < $newComponents->length; $i++) {
					$newComponent = $newComponents->item($i);
					$name = $newComponent->getAttribute($mergeRule['attrId']);
					
					// Check if component with same name exists in current DOM
					$existingComponent = null;
					$currentComponents = $thisComponentsNode->getElementsByTagName($mergeRule['contents']);
					for ($j = 0; $j < $currentComponents->length; $j++) {
						if ($currentComponents->item($j)->getAttribute($mergeRule['attrId']) === $name) {
							$existingComponent = $currentComponents->item($j);
							break;
						}
					}
					
					// Import the new component into the current DOM
					$importedComponent = $this->dom->importNode($newComponent, true);
					
					if ($existingComponent) {
						// Replace existing component
						$thisComponentsNode->replaceChild($importedComponent, $existingComponent);
					} else {
						// Add new component
						$thisComponentsNode->appendChild($importedComponent);
					}
				}
			}
		}


		return true;
	}
}
