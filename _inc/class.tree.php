<?php

$user_id = $GLOBALS['fpk_id'];
//if ($user_id == '') $user_id=11;

function cheltime2($time)
{
//Прибавить 6 часов разницы во времени (часовые пояса) чтобы по Гринвичу
 return $time+(0)*60*60;
}

function showdate2($mydate) 
{
return $mydate;
}


class _tree_struct {
	
	// Structure table and fields
	protected $table	= "";
	protected $fields	= array(
			"id"		=> false,
			"parent_id"	=> false,
			"position"	=> false,
			"left"		=> false,
			"right"		=> false,
			"level"		=> false
		);

	// Constructor
	function __construct($table = "tree", $fields = array()) {
		$this->table = $table;
		if(!count($fields)) {
			foreach($this->fields as $k => &$v) { $v = $k; }
		}
		else {
			foreach($fields as $key => $field) {
				switch($key) {
					case "id":
					case "parent_id":
					case "position":
					case "left":
					case "right":
					case "level":
						$this->fields[$key] = $field;
						break;
				}
			}
		}
		// Database
		$this->db = new _database;
	}

	function _get_node($id) {		
		$this->db->query("SELECT `".implode("` , `", $this->fields)."` FROM `".$this->table."` WHERE user_id='".$GLOBALS["user_id"]."' AND `".$this->fields["id"]."` = ".(int) $id);
		$this->db->nextr();
		return $this->db->nf() === 0 ? false : $this->db->get_row("assoc");
	}
	function _get_children($id, $recursive = false) {
		$children = array();
		if($_GET["show_checked"]=='false') $show_check=" AND `did`='0000-00-00 00:00:00' ";
		else $show_check="";
		
		if($recursive) {
			$node = $this->_get_node($id);
			$this->db->query("SELECT `".implode("` , `", $this->fields)."` FROM `".$this->table."` WHERE user_id='".$GLOBALS["user_id"]."' AND `".$this->fields["left"]."` >= ".(int) $node[$this->fields["left"]]." AND `".$this->fields["right"]."` <= ".(int) $node[$this->fields["right"]]." $show_check ORDER BY `".$this->fields["left"]."` ASC");
		}
		else { //Главный запрос
		    $sqlnews = "SELECT `".implode("` , `", $this->fields)."` FROM `".$this->table."` WHERE  ( FIND_IN_SET(".$GLOBALS["user_id"].",`share`) OR FIND_IN_SET('-1',`share`) OR user_id='".$GLOBALS["user_id"]."' ) AND `".$this->fields["parent_id"]."` = ".(int) $id." $show_check ORDER BY `".$this->fields["position"]."` ASC";
//		echo $sqlnews;		    
		    
			$this->db->query($sqlnews);
		}
		while($this->db->nextr()) $children[$this->db->f($this->fields["id"])] = $this->db->get_row("assoc");
		return $children;
	}
	function _get_path($id) {
		$node = $this->_get_node($id);
		$path = array();
		if($node === false) return false;
		
		$news = "SELECT `".implode("` , `", $this->fields)."` FROM `".$this->table."` WHERE  user_id='".$GLOBALS["user_id"]."' AND `".$this->fields["left"]."` <= ".(int) $node[$this->fields["left"]]." AND `".$this->fields["right"]."` >= ".(int) $node[$this->fields["right"]]." ORDER by level";
		
		$this->db->query($news);
		
		
		while($this->db->nextr()) $path[$this->db->f($this->fields["id"])] = $this->db->get_row("assoc");
		return $path;
	}

	function _create($parent, $position) {
		return $this->_move(0, $parent, $position);
	}
	function _remove($id) {
		if((int)$id === 1) { return false; }
		$data = $this->_get_node($id);
		$lft = (int)$data[$this->fields["left"]];
		$rgt = (int)$data[$this->fields["right"]];
		$dif = $rgt - $lft + 1;

		// deleting node and its children
		$this->db->query("" . 
			"DELETE FROM `".$this->table."` " . 
			"WHERE user_id=".$GLOBALS["user_id"]." AND `".$this->fields["left"]."` >= ".$lft." AND `".$this->fields["right"]."` <= ".$rgt
		);
		// shift left indexes of nodes right of the node
		$this->db->query("".
			"UPDATE `".$this->table."` " . 
				"SET `".$this->fields["left"]."` = `".$this->fields["left"]."` - ".$dif." " . 
			"WHERE user_id=".$GLOBALS["user_id"]." AND `".$this->fields["left"]."` > ".$rgt
		);
		// shift right indexes of nodes right of the node and the node's parents
		$this->db->query("" . 
			"UPDATE `".$this->table."` " . 
				"SET `".$this->fields["right"]."` = `".$this->fields["right"]."` - ".$dif." " . 
			"WHERE user_id=".$GLOBALS["user_id"]." AND `".$this->fields["right"]."` > ".$lft
		);

		$pid = (int)$data[$this->fields["parent_id"]];
		$pos = (int)$data[$this->fields["position"]];

		// Update position of siblings below the deleted node
		$this->db->query("" . 
			"UPDATE `".$this->table."` " . 
				"SET `".$this->fields["position"]."` = `".$this->fields["position"]."` - 1 " . 
			"WHERE user_id=".$GLOBALS["user_id"]." AND `".$this->fields["parent_id"]."` = ".$pid." AND `".$this->fields["position"]."` > ".$pos
		);
		return true;
	}
	function _move($id, $ref_id, $position = 0, $is_copy = false) {
		if((int)$ref_id === 0 || (int)$id === 1) { return false; }
		$sql		= array();						// Queries executed at the end
		$node		= $this->_get_node($id);		// Node data
		$nchildren	= $this->_get_children($id);	// Node children
		$ref_node	= $this->_get_node($ref_id);	// Ref node data
		$rchildren	= $this->_get_children($ref_id);// Ref node children

		$ndif = 2;
		$node_ids = array(-1);
		if($node !== false) {
			$node_ids = array_keys($this->_get_children($id, true));
			// TODO: should be !$is_copy && , but if copied to self - screws some right indexes
			if(in_array($ref_id, $node_ids)) return false;
			$ndif = $node[$this->fields["right"]] - $node[$this->fields["left"]] + 1;
		}
		if($position >= count($rchildren)) {
			$position = count($rchildren);
		}

		// Not creating or copying - old parent is cleaned
		if($node !== false && $is_copy == false) {
			$sql[] = "" . 
				"UPDATE `".$this->table."` " . 
					"SET `".$this->fields["position"]."` = `".$this->fields["position"]."` - 1 " . 
				"WHERE user_id=".$GLOBALS["user_id"]." AND " . 
					"`".$this->fields["parent_id"]."` = ".$node[$this->fields["parent_id"]]." AND " . 
					"`".$this->fields["position"]."` > ".$node[$this->fields["position"]];
			$sql[] = "" . 
				"UPDATE `".$this->table."` " . 
					"SET `".$this->fields["left"]."` = `".$this->fields["left"]."` - ".$ndif." " . 
				"WHERE user_id=".$GLOBALS["user_id"]." AND `".$this->fields["left"]."` > ".$node[$this->fields["right"]];
			$sql[] = "" . 
				"UPDATE `".$this->table."` " . 
					"SET `".$this->fields["right"]."` = `".$this->fields["right"]."` - ".$ndif." " . 
				"WHERE user_id=".$GLOBALS["user_id"]." AND " . 
					"`".$this->fields["right"]."` > ".$node[$this->fields["left"]]." AND " . 
					"`".$this->fields["id"]."` NOT IN (".implode(",", $node_ids).") ";
		}
		// Preparing new parent
		$sql[] = "" . 
			"UPDATE `".$this->table."` " . 
				"SET `".$this->fields["position"]."` = `".$this->fields["position"]."` + 1 " . 
			"WHERE user_id=".$GLOBALS["user_id"]." AND " . 
				"`".$this->fields["parent_id"]."` = ".$ref_id." AND " . 
				"`".$this->fields["position"]."` >= ".$position." " . 
				( $is_copy ? "" : " AND `".$this->fields["id"]."` NOT IN (".implode(",", $node_ids).") ");

		$ref_ind = $ref_id === 0 ? (int)$rchildren[count($rchildren) - 1][$this->fields["right"]] + 1 : (int)$ref_node[$this->fields["right"]];
		$ref_ind = max($ref_ind, 1);

		$self = ($node !== false && !$is_copy && (int)$node[$this->fields["parent_id"]] == $ref_id && $position > $node[$this->fields["position"]]) ? 1 : 0;
		foreach($rchildren as $k => $v) {
			if($v[$this->fields["position"]] - $self == $position) {
				$ref_ind = (int)$v[$this->fields["left"]];
				break;
			}
		}
		if($node !== false && !$is_copy && $node[$this->fields["left"]] < $ref_ind) {
			$ref_ind -= $ndif;
		}

		$sql[] = "" . 
			"UPDATE `".$this->table."` " . 
				"SET `".$this->fields["left"]."` = `".$this->fields["left"]."` + ".$ndif." " . 
			"WHERE user_id=".$GLOBALS["user_id"]." AND " . 
				"`".$this->fields["left"]."` >= ".$ref_ind." " . 
				( $is_copy ? "" : " AND `".$this->fields["id"]."` NOT IN (".implode(",", $node_ids).") ");
		$sql[] = "" . 
			"UPDATE `".$this->table."` " . 
				"SET `".$this->fields["right"]."` = `".$this->fields["right"]."` + ".$ndif." " . 
			"WHERE user_id=".$GLOBALS["user_id"]." AND " . 
				"`".$this->fields["right"]."` >= ".$ref_ind." " . 
				( $is_copy ? "" : " AND `".$this->fields["id"]."` NOT IN (".implode(",", $node_ids).") ");

		$ldif = $ref_id == 0 ? 0 : $ref_node[$this->fields["level"]] + 1;
		$idif = $ref_ind;
		if($node !== false) {
			$ldif = $node[$this->fields["level"]] - ($ref_node[$this->fields["level"]] + 1);
			$idif = $node[$this->fields["left"]] - $ref_ind;
			if($is_copy) {
				$sql[] = "" . 
					"INSERT INTO `".$this->table."` (" . 
						"`".$this->fields["parent_id"]."`, " . 
						"`".$this->fields["position"]."`, " . 
						"`".$this->fields["left"]."`, " . 
						"`".$this->fields["right"]."`, " . 
						"`".$this->fields["level"]."`," . 
						"`user_id`".
					") " . 
						"SELECT " . 
							"".$ref_id.", " . 
							"`".$this->fields["position"]."`, " . 
							"`".$this->fields["left"]."` - (".($idif + ($node[$this->fields["left"]] >= $ref_ind ? $ndif : 0))."), " . 
							"`".$this->fields["right"]."` - (".($idif + ($node[$this->fields["left"]] >= $ref_ind ? $ndif : 0))."), " . 
							"`".$this->fields["level"]."` - (".$ldif."), " . 
							$GLOBALS['user_id']." ".
						"FROM `".$this->table."` " . 
						"WHERE " . 
							"`".$this->fields["id"]."` IN (".implode(",", $node_ids).") " . 
						"ORDER BY `".$this->fields["level"]."` ASC";
						print_r($sql);
			}
			else {
				$sql[] = "" . 
					"UPDATE `".$this->table."` SET " . 
						"`".$this->fields["parent_id"]."` = ".$ref_id.", " . 
						"`".$this->fields["position"]."` = ".$position." " . 
					"WHERE user_id=".$GLOBALS["user_id"]." AND " . 
						"`".$this->fields["id"]."` = ".$id;
				$sql[] = "" . 
					"UPDATE `".$this->table."` SET " . 
						"`".$this->fields["left"]."` = `".$this->fields["left"]."` - (".$idif."), " . 
						"`".$this->fields["right"]."` = `".$this->fields["right"]."` - (".$idif."), " . 
						"`".$this->fields["level"]."` = `".$this->fields["level"]."` - (".$ldif.") " . 
					"WHERE user_id=".$GLOBALS["user_id"]." AND " . 
						"`".$this->fields["id"]."` IN (".implode(",", $node_ids).") ";
			}
		}
		else {
			//создание нового дела
			$sqlnews1 = "SELECT `share` FROM tree WHERE id = '$ref_id'";
			$result1 = mysql_query_my($sqlnews1); 
		    @$sql1 = mysql_fetch_array($result1);
		    $share = $sql1['share'];
			
			//нужно узнать чему равно поле shared у родителя
			$sql[] = "" . 
				"INSERT INTO `".$this->table."` (" . 
					"`".$this->fields["parent_id"]."`, " . 
					"`".$this->fields["position"]."`, " . 
					"`".$this->fields["left"]."`, " . 
					"`".$this->fields["right"]."`, " . 
					"`".$this->fields["level"]."`, " . 
					"`user_id`, " .
					"`share` " .
					") " . 
				"VALUES (" . 
					$ref_id.", " . 
					$position.", " . 
					$idif.", " . 
					($idif + 1).", " . 
					$ldif. ", " .
					$GLOBALS["user_id"].", " .
					"'".$share."'".
					
				")";

		}
		foreach($sql as $q) { $this->db->query($q); }
		$ind = $this->db->insert_id();
		if($is_copy) $this->_fix_copy($ind, $position);
		return $node === false || $is_copy ? $ind : true;
	}
	function _fix_copy($id, $position) {
		$node = $this->_get_node($id);
		$children = $this->_get_children($id, true);

		$map = array();
		for($i = $node[$this->fields["left"]] + 1; $i < $node[$this->fields["right"]]; $i++) {
			$map[$i] = $id;
		}
		foreach($children as $cid => $child) {
			if((int)$cid == (int)$id) {
				$this->db->query("UPDATE `".$this->table."` SET `".$this->fields["position"]."` = ".$position." WHERE user_id=".$GLOBALS["user_id"]." AND `".$this->fields["id"]."` = ".$cid);
				continue;
			}
			$this->db->query("UPDATE `".$this->table."` SET `".$this->fields["parent_id"]."` = ".$map[(int)$child[$this->fields["left"]]]." WHERE user_id=".$GLOBALS["user_id"]." AND `".$this->fields["id"]."` = ".$cid);
			for($i = $child[$this->fields["left"]] + 1; $i < $child[$this->fields["right"]]; $i++) {
				$map[$i] = $cid;
			}
		}
	}

	function _reconstruct() {
		$sqlnews = "CREATE TABLE `temp_tree` (" . 
				"`".$this->fields["id"]."` INTEGER NOT NULL, " . 
				"`".$this->fields["parent_id"]."` INTEGER NOT NULL, " . 
				"`". $this->fields["position"]."` INTEGER NOT NULL" . 
			")";
		echo $sqlnews;	
		$this->db->query("" . $sqlnews
		);
		$this->db->query("" . 
			"INSERT INTO `temp_tree` " . 
				"SELECT " . 
					"`".$this->fields["id"]."`, " . 
					"`".$this->fields["parent_id"]."`, " . 
					"`".$this->fields["position"]."` " . 
				"FROM `".$this->table."` WHERE user_id=11"
		);

		$this->db->query("" . 
			"CREATE TABLE `temp_stack` (" . 
				"`".$this->fields["id"]."` INTEGER NOT NULL, " . 
				"`".$this->fields["left"]."` INTEGER, " . 
				"`".$this->fields["right"]."` INTEGER, " . 
				"`".$this->fields["level"]."` INTEGER, " . 
				"`stack_top` INTEGER NOT NULL, " . 
				"`".$this->fields["parent_id"]."` INTEGER, " . 
				"`".$this->fields["position"]."` INTEGER " . 
			");"
		);
		$counter = 2;
		$this->db->query("SELECT COUNT(*) FROM temp_tree");
		$this->db->nextr();
		$maxcounter = (int) $this->db->f(0) * 2;
		$currenttop = 1;
		$this->db->query("" . 
			"INSERT INTO `temp_stack` " . 
				"SELECT " . 
					"`".$this->fields["id"]."`, " . 
					"1, " . 
					"NULL, " . 
					"0, " . 
					"1, " . 
					"`".$this->fields["parent_id"]."`, " . 
					"`".$this->fields["position"]."` " . 
				"FROM `temp_tree` " . 
				"WHERE `".$this->fields["parent_id"]."` = 0"
		);
		$this->db->query("DELETE FROM `temp_tree` WHERE `".$this->fields["parent_id"]."` = 0");

		while ($counter <= $maxcounter) {
			$this->db->query("" . 
				"SELECT " . 
					"`temp_tree`.`".$this->fields["id"]."` AS tempmin, " . 
					"`temp_tree`.`".$this->fields["parent_id"]."` AS pid, " . 
					"`temp_tree`.`".$this->fields["position"]."` AS lid " . 
				"FROM `temp_stack`, `temp_tree` " . 
				"WHERE " . 
					"`temp_stack`.`".$this->fields["id"]."` = `temp_tree`.`".$this->fields["parent_id"]."` AND " . 
					"`temp_stack`.`stack_top` = ".$currenttop." " . 
				"ORDER BY `temp_tree`.`".$this->fields["position"]."` ASC LIMIT 1"
			);

			if ($this->db->nextr()) {
				$tmp = $this->db->f("tempmin");

				$q = "INSERT INTO temp_stack (stack_top, `".$this->fields["id"]."`, `".$this->fields["left"]."`, `".$this->fields["right"]."`, `".$this->fields["level"]."`, `".$this->fields["parent_id"]."`, `".$this->fields["position"]."`) VALUES(".($currenttop + 1).", ".$tmp.", ".$counter.", NULL, ".$currenttop.", ".$this->db->f("pid").", ".$this->db->f("lid").")";
				$this->db->query($q);
				$this->db->query("DELETE FROM `temp_tree` WHERE `".$this->fields["id"]."` = ".$tmp);
				$counter++;
				$currenttop++;
			}
			else {
				$this->db->query("" . 
					"UPDATE temp_stack SET " . 
						"`".$this->fields["right"]."` = ".$counter.", " . 
						"`stack_top` = -`stack_top` " . 
					"WHERE `stack_top` = ".$currenttop
				);
				$counter++;
				$currenttop--;
			}
		}

		$temp_fields = $this->fields;
		unset($temp_fields["parent_id"]);
		unset($temp_fields["position"]);
		unset($temp_fields["left"]);
		unset($temp_fields["right"]);
		unset($temp_fields["level"]);
		if(count($temp_fields) > 1) {
			$this->db->query("" . 
				"CREATE TABLE `temp_tree2` " . 
					"SELECT `".implode("`, `", $temp_fields)."` FROM `".$this->table."` "
			);
		}
//		echo 'hi!'.$counter;
//		return true;
		
		$this->db->query("DELETE * FROM `".$this->table."` WHERE user_id = 11");
		$sqlnews = "" . 
			"INSERT INTO ".$this->table." (" . 
					"`".$this->fields["id"]."`, " . 
					"`".$this->fields["parent_id"]."`, " . 
					"`".$this->fields["position"]."`, " . 
					"`".$this->fields["left"]."`, " . 
					"`".$this->fields["right"]."`, " . 
					"`".$this->fields["level"]."` " . 
				") " . 
				"SELECT " . 
					"`".$this->fields["id"]."`, " . 
					"`".$this->fields["parent_id"]."`, " . 
					"`".$this->fields["position"]."`, " . 
					"`".$this->fields["left"]."`, " . 
					"`".$this->fields["right"]."`, " . 
					"`".$this->fields["level"]."` " . 
				"FROM temp_stack " . 
				"ORDER BY `".$this->fields["id"]."`";
		echo '<hr>'.$sqlnews;
				
		$this->db->query($sqlnews);
		
		
		if(count($temp_fields) > 1) {
			$sql = "" . 
				"UPDATE `".$this->table."` v, `temp_tree2` SET v.`".$this->fields["id"]."` = v.`".$this->fields["id"]."` ";
			foreach($temp_fields as $k => $v) {
				if($k == "id") continue;
				$sql .= ", v.`".$v."` = `temp_tree2`.`".$v."` ";
			}
			$sql .= " WHERE v.`".$this->fields["id"]."` = `temp_tree2`.`".$this->fields["id"]."` ";
			$this->db->query($sql);
		}
	}

	function _analyze() {
		$report = array();

		$this->db->query("" . 
			"SELECT " . 
				"`".$this->fields["left"]."` FROM `".$this->table."` s " . 
			"WHERE " . 
				"`".$this->fields["parent_id"]."` = 0 "
		);
		$this->db->nextr();
		if($this->db->nf() == 0) {
			$report[] = "[FAIL]\tNo root node.";
		}
		else {
			$report[] = ($this->db->nf() > 1) ? "[FAIL]\tMore than one root node." : "[OK]\tJust one root node.";
		}
		$report[] = ($this->db->f(0) != 1) ? "[FAIL]\tRoot node's left index is not 1." : "[OK]\tRoot node's left index is 1.";

		$this->db->query("" . 
			"SELECT " . 
				"COUNT(*) FROM `".$this->table."` s " . 
			"WHERE " . 
				"`".$this->fields["parent_id"]."` != 0 AND " . 
				"(SELECT COUNT(*) FROM `".$this->table."` WHERE `".$this->fields["id"]."` = s.`".$this->fields["parent_id"]."`) = 0 ");
		$this->db->nextr();
		$report[] = ($this->db->f(0) > 0) ? "[FAIL]\tMissing parents." : "[OK]\tNo missing parents.";

		$this->db->query("SELECT MAX(`".$this->fields["right"]."`) FROM `".$this->table."`");
		$this->db->nextr();
		$n = $this->db->f(0);
		$this->db->query("SELECT COUNT(*) FROM `".$this->table."`");
		$this->db->nextr();
		$c = $this->db->f(0);
		$report[] = ($n/2 != $c) ? "[FAIL]\tRight index does not match node count." : "[OK]\tRight index matches count.";

		$this->db->query("" . 
			"SELECT COUNT(`".$this->fields["id"]."`) FROM `".$this->table."` s " . 
			"WHERE " . 
				"(SELECT COUNT(*) FROM `".$this->table."` WHERE " . 
					"`".$this->fields["right"]."` < s.`".$this->fields["right"]."` AND " . 
					"`".$this->fields["left"]."` > s.`".$this->fields["left"]."` AND " . 
					"`".$this->fields["level"]."` = s.`".$this->fields["level"]."` + 1" . 
				") != " .
				"(SELECT COUNT(*) FROM `".$this->table."` WHERE " . 
					"`".$this->fields["parent_id"]."` = s.`".$this->fields["id"]."`" . 
				") "
			);
		$this->db->nextr();
		$report[] = ($this->db->f(0) > 0) ? "[FAIL]\tAdjacency and nested set do not match." : "[OK]\tNS and AJ match";

		return implode("<br />",$report);
	}

	function _dump($output = false) {
		$nodes = array();
		$this->db->query("SELECT * FROM ".$this->table." ORDER BY `".$this->fields["left"]."`");
		while($this->db->nextr()) $nodes[] = $this->db->get_row("assoc");
		if($output) {
			echo "<pre>";
			foreach($nodes as $node) {
				echo str_repeat("&#160;",(int)$node[$this->fields["level"]] * 2);
				echo $node[$this->fields["id"]]." (".$node[$this->fields["left"]].",".$node[$this->fields["right"]].",".$node[$this->fields["level"]].",".$node[$this->fields["parent_id"]].",".$node[$this->fields["position"]].")<br />";
			}
			echo str_repeat("-",40);
			echo "</pre>";
		}
		return $nodes;
	}
	function _drop() {
		$this->db->query("TRUNCATE TABLE `".$this->table."`");
		$this->db->query("" . 
				"INSERT INTO `".$this->table."` (" . 
					"`".$this->fields["id"]."`, " . 
					"`".$this->fields["parent_id"]."`, " . 
					"`".$this->fields["position"]."`, " . 
					"`".$this->fields["left"]."`, " . 
					"`".$this->fields["right"]."`, " . 
					"`".$this->fields["level"]."` " . 
					") " . 
				"VALUES (" . 
					"1, " . 
					"0, " . 
					"0, " . 
					"1, " . 
					"2, " . 
					"0 ". 
				")");
	}
}

class json_tree extends _tree_struct { 
	//Добавление нужных полей в запрос
	function __construct($table = "tree", $fields = array(), $add_fields = array("title" => "title", "type" => "type","date1"=>"date1", "date2"=>"date2", "remind"=>"remind","did"=>"did", "text"=>"text", "node_icon"=>"node_icon")) {
		parent::__construct($table, $fields);
		$this->fields = array_merge($this->fields, $add_fields);
		$this->add_fields = $add_fields;
	}

	function create_node($data) {
	
				function my_path($id)
				{
				  $jstree = new json_tree();
				  //поиск родителя
					
					$child = $jstree->_get_path($id);
					
					$child = array_keys($child);
					
					$path='';
					for($i=0; $i<count($child); $i++)
						{
						$path .= $child[$i];
						if ($i!=count($child)-1) $path .= ',';
						}
				return $path;
				}
	
	
		$id = parent::_create((int)$data[$this->fields["id"]], (int)$data[$this->fields["position"]]);
		if($id) {
			$data["id"] = $id;
			$this->set_data($data);
			return  "{ \"status\" : 1, \"id\" : ".(int)$id.", \"path\" : \"".my_path($id)."\" }";
		}
		return "{ \"status\" : 0 }";
	}
	function set_data($data) {
		
		if(count($this->add_fields) == 0) { return "{ \"status\" : 1 }"; }
		$s = "UPDATE `".$this->table."` SET `".$this->fields["id"]."` = `".$this->fields["id"]."` "; 
		foreach($this->add_fields as $k => $v) {
			if(isset($data[$k]))	$s .= ", `".$this->fields[$v]."` = \"".$this->db->escape($data[$k])."\" ";
			else					$s .= ", `".$this->fields[$v]."` = `".$this->fields[$v]."` ";
		}
		$s .= "WHERE  user_id=".$GLOBALS["user_id"]." AND `".$this->fields["id"]."` = ".(int)$data["id"];
		$this->db->query($s);
		return "{ \"status\" : 1 }";
	}
	function rename_node($data) { return $this->set_data($data); }

	function move_node($data) { 
		$id = parent::_move((int)$data["id"], (int)$data["ref"], (int)$data["position"], (int)$data["copy"]);
		if(!$id) return "{ \"status\" : 0 }";
		if((int)$data["copy"] && count($this->add_fields)) {
			$ids	= array_keys($this->_get_children($id, true));
			$data	= $this->_get_children((int)$data["id"], true);

			$i = 0;
			foreach($data as $dk => $dv) {
				$s = "UPDATE `".$this->table."` SET `".$this->fields["id"]."` = `".$this->fields["id"]."` "; 
				foreach($this->add_fields as $k => $v) {
					if(isset($dv[$k]))	$s .= ", `".$this->fields[$v]."` = \"".$this->db->escape($dv[$k])."\" ";
					else				$s .= ", `".$this->fields[$v]."` = `".$this->fields[$v]."` ";
				}
				$s .= "WHERE `".$this->fields["id"]."` = ".$ids[$i];
				$this->db->query($s);
				$i++;
			}
		}
		return "{ \"status\" : 1, \"id\" : ".$id." }";
	}
	function remove_node($data) {
		$id = parent::_remove((int)$data["id"]);
		return "{ \"status\" : 1 }";
	}
	function get_children($data) { ///вывод детей
		$tmp = $this->_get_children((int)$data["id"],false);
//		print_r($data);

		if((int)$data["id"] === 1 && count($tmp) === 1) {
			$this->_create_default();
			$tmp = $this->_get_children((int)$data["id"],false);
		}
		$result = array();
		if((int)$data["id"] === 0) return json_encode($result);
		
		
		foreach($tmp as $k => $v) {
		///Передаю данные дереву
			$date1=showdate2($v[$this->fields["date1"]]);
			$date2=showdate2($v[$this->fields["date2"]]);
			
preg_match('/<img[^>]+src=([\'"])?((?(1).+?|[^\s>]+))(?(1)\1)/', $v[$this->fields["text"]], $matches);
			
			if($matches[0]) $img = $matches[0].'>';
			else $img="";
			
			$text = str_replace(array('<br />','</li>','</p>'),"@@@",$v[$this->fields["text"]]);
			
			$img='';
			$shorttext=$img.substr(strip_tags($text),0,400);

			$shorttext = str_replace("@@@","<br>",$shorttext);
			$shorttext = str_replace('"',"'",$shorttext);
			$shorttext = str_replace("&nbsp;"," ",$shorttext);

			$did=($v[$this->fields["did"]]);
			$remind=($v[$this->fields["remind"]]);
			$node_icon = ($v[$this->fields["node_icon"]]);
			
			if( $v[$this->fields["type"]]=='default' ) ;

			$lr = (int)((int)$v[right]-(int)$v[left]);

			if ($lr==1) 
			   {
			   if (($v[$this->fields["node_icon"]]=='') OR (strlen($v['text'])==0)) $node_icon = "file.png";
			   else $node_icon = $v[$this->fields["node_icon"]];
			   }
			else $node_icon="file.png";
			
			
//			print_r($v);
			
			//$v[$this->fields["date1"]];
			$res = array();
			
			$result[] = array(
				"attr" => array("id" => "node_".$k, "rel" => $v[$this->fields["type"]]),
				"data" => array("title" => $v[$this->fields["title"]],"icon" => $node_icon),
				"date1" => $date1,
				"date2" => $date2,
				"children" => $res,
				"shorttext" => $shorttext,
				"remind" => $remind,
				"did" => $did,
				"state" => ((int)$v[$this->fields["right"]] - (int)$v[$this->fields["left"]] > 1) ? "closed" : ""
			);
		}
//				print_r($result);

		return json_encode($result);
	}













	function get_children_all2($data) { ///вывод детей
		$tmp = $this->_get_children((int)$data["id"],false);
		

		if((int)$data["id"] === 1 && count($tmp) === 1) {
			$this->_create_default();
			$tmp = $this->_get_children((int)$data["id"],false);
		}

	
		$result = $this->get_recursive_children2((int)$data["id"]);
//		print_r($result);

		return json_encode($result);




	}


function get_recursive_children2($id)
{
		//считываю всех прямых потомков
		$tmp = $this->_get_children($id);
				
		//заполняю параметры
		foreach($tmp as $k => $v) {
			$date1=showdate2($v[$this->fields["date1"]]);
			$date2=showdate2($v[$this->fields["date2"]]);
			preg_match('/<img[^>]+src=([\'"])?((?(1).+?|[^\s>]+))(?(1)\1)/', $v[$this->fields["text"]], $matches);
			if($matches[0]) $img = $matches[0].'>';
			else $img="";
			$text = str_replace(array('<br />','</li>','</p>'),"@@@",$v[$this->fields["text"]]);
			$img='';
			$shorttext=$img.substr(strip_tags($text),0,400);
			$shorttext = str_replace("@@@","<br>",$shorttext);
			$shorttext = str_replace('"',"'",$shorttext);
			$shorttext = str_replace("&nbsp;"," ",$shorttext);
			$did=($v[$this->fields["did"]]);
			$remind=($v[$this->fields["remind"]]);
			$node_icon = ($v[$this->fields["node_icon"]]);
			if( $v[$this->fields["type"]]=='default' ) ;
			$lr = (int)((int)$v[right]-(int)$v[left]);
			if ($lr==1) 
			   {
			   if (($v[$this->fields["node_icon"]]=='') OR (strlen($v['text'])==0)) $node_icon = "file.png";
			   else $node_icon = $v[$this->fields["node_icon"]];
			   }
			else $node_icon="file.png";
			
	$res = '';
	if ((int)$v[$this->fields["right"]] - (int)$v[$this->fields["left"]] > 1) $res = $this->get_recursive_children2($k);
						
			$result[$k][] = array(
				"attr" => array("id" => "node_".$k, "rel" => $v[$this->fields["type"]]),
				"data" => array("title" => $v[$this->fields["title"]],"icon" => $node_icon),
				"date1" => $date1,
				"date2" => $date2,
				"children" => $res,
				"shorttext" => $shorttext,
				"remind" => $remind,
				"did" => $did,
				"state" => ((int)$v[$this->fields["right"]] - (int)$v[$this->fields["left"]] > 1) ? "closed" : ""
			);
		}
	return $result;
}












	function get_children_all($data) { ///вывод детей

		$tmp = $this->_get_children((int)$data["id"],false);
		

		if((int)$data["id"] === 1 && count($tmp) === 1) {
			$this->_create_default();
			$tmp = $this->_get_children((int)$data["id"],false);
		}

	
		$result = $this->get_recursive_children((int)$data["id"]);
//		print_r($result);

		return json_encode($result);




	}


function get_recursive_children($id)
{
		//считываю всех прямых потомков
		$tmp = $this->_get_children($id);
		
		//заполняю параметры
		foreach($tmp as $k => $v) {
			$date1=showdate2($v[$this->fields["date1"]]);
			$date2=showdate2($v[$this->fields["date2"]]);
			preg_match('/<img[^>]+src=([\'"])?((?(1).+?|[^\s>]+))(?(1)\1)/', $v[$this->fields["text"]], $matches);
			if($matches[0]) $img = $matches[0].'>';
			else $img="";
			$text = str_replace(array('<br />','</li>','</p>'),"@@@",$v[$this->fields["text"]]);
			$img='';
			$shorttext=$img.substr(strip_tags($text),0,400);
			$shorttext = str_replace("@@@","<br>",$shorttext);
			$shorttext = str_replace('"',"'",$shorttext);
			$shorttext = str_replace("&nbsp;"," ",$shorttext);
			$did=($v[$this->fields["did"]]);
			$remind=($v[$this->fields["remind"]]);
			$node_icon = ($v[$this->fields["node_icon"]]);
			if( $v[$this->fields["type"]]=='default' ) ;
			$lr = (int)((int)$v[right]-(int)$v[left]);
			if ($lr==1) 
			   {
			   if (($v[$this->fields["node_icon"]]=='') OR (strlen($v['text'])==0)) $node_icon = "file.png";
			   else $node_icon = $v[$this->fields["node_icon"]];
			   }
			else $node_icon="file.png";
			
	$res = '';
	if ((int)$v[$this->fields["right"]] - (int)$v[$this->fields["left"]] > 1) $res = $this->get_recursive_children($k);
						
			$result[] = array(
				"attr" => array("id" => "node_".$k, "rel" => $v[$this->fields["type"]]),
				"data" => array("title" => $v[$this->fields["title"]],"icon" => $node_icon),
				"date1" => $date1,
				"date2" => $date2,
				"children" => $res,
				"shorttext" => $shorttext,
				"remind" => $remind,
				"did" => $did,
				"state" => ((int)$v[$this->fields["right"]] - (int)$v[$this->fields["left"]] > 1) ? "closed" : ""
			);
		}
	return $result;
}


	function search($data) {
	
		$id = str_replace("#node_","",$data["search_str"]);
		$sqlnews = "SELECT `".$this->fields["left"]."`, `".$this->fields["right"]."` FROM `".$this->table."` WHERE `".$this->fields["title"]."` LIKE '%".$this->db->escape($data["search_str"])."%' OR `".$this->fields["id"]."` = '".$id."' OR  `".$this->fields["text"]."` LIKE '%".$this->db->escape($data["search_str"])."%' ";
		$this->db->query($sqlnews);
//		echo $sqlnews;
		
		if($this->db->nf() === 0) return "[]";
		$q = "SELECT DISTINCT `".$this->fields["id"]."` FROM `".$this->table."` WHERE 0 ";
		while($this->db->nextr()) {
			$q .= " OR (`".$this->fields["left"]."` < ".(int)$this->db->f(0)." AND `".$this->fields["right"]."` > ".(int)$this->db->f(1).") ";
		}
		$result = array();
		$this->db->query($q);
		while($this->db->nextr()) { $result[] = "#node_".$this->db->f(0); }
		return json_encode($result);
	}







	function _create_default() {
//		$this->_drop();
	if(true)
	   {
		$tt = $this->create_node(array(
			"id" => 1,
			"position" => 0,
			"title" => "_НОВОЕ",
			"type" => "drive"
		));		
		$tt = json_decode($tt);
		$tt = $tt->id;

		$ss = $this->create_node(array(
			"id" => $tt,
			"parent" => $tt,
			"position" => 0,
			"title" => "На этом деле можно нажать правую клавишу мыши, там есть меню",
			"text" => '<p>Вы можете нажать правую клавишу мыши на деле в дереве, появится меню:</p>

<p><img title="Загружено из буфера обмена Mon Oct 15 2012 20:27:13 GMT+0600 (YEKT)" src="data/2647/clipboard_399.png" style="cursor: default; "></p>',
			"type" => "default"
		));				
		
		$this->create_node(array(
			"id" => $tt,
			"parent" => $tt,
			"position" => 1,
			"title" => "Ctrl + стрелка вниз — добавляют новое дело, а внизу вы можете писать заметку и даже вставлять картинки из буфера обмена",
			"text" => "Ctrl+вниз — самое удобное сочетание для создания дела, но при этом, у вас не должен моргать курсор в этом редакторе!",
			"type" => "default"
		));
		$this->create_node(array(
			"id" => $tt,
			"parent" => $tt,
			"position" => 2,
			"title" => "Вы можете перетащить это дело в календарь, таким образом вы назначите дату и время этому событию",
			"text" => 'Вы можете перетаскивать дело из дерева в календарь, определяя ему дату и время:<div><img title="Загружено из буфера обмена Mon Oct 15 2012 23:49:18 GMT+0600 (YEKT)" src="data/2826/clipboard_161.png" style="cursor: default; "></div>',
			"type" => "default"
		));
		$tt = $this->create_node(array(
			"id" => $tt,
			"parent" => $tt,
			"position" => 2,
			"title" => "Если всё дело написано большими буквами, оно превращается в ПАПКУ, которая выглядит как закладка сверху",
			"text" => '<h3>Создание закладок, например для проектов</h3>

<p>Всё, что написано в дереве БОЛЬШИМИ БУКВАМИ превращается в верхнюю Закладку:</p>

<p><img title="Загружено из буфера обмена Mon Oct 15 2012 23:51:32 GMT+0600 (YEKT)" src="data/2649/clipboard_335.png" style="cursor: default; "></p>

<p>Счётчик указывает, сколько дел внутри. В каждой вкладке запоминается текущая позиция выбранного дела, а также сохраняется вся информация о том, какие дела свёрнуты, а какие развёрнуты.</p>',
			"type" => "default"
		));

		$tt = json_decode($tt);
		$tt = $tt->id;

		$tt = $this->create_node(array(
			"id" => $tt,
			"parent" => $tt,
			"position" => 2,
			"title" => "МОИ ЦЕЛИ",
			"text" => "Вот эта папка написана БОЛЬШИМИ БУКВАМИ поэтому присутствует вверху в закладках",
			"type" => "default"
		));

		$tt = json_decode($tt);
		$tt = $tt->id;

		$this->create_node(array(
			"id" => $tt,
			"parent" => $tt,
			"position" => 2,
			"title" => "Свой дом",
			"text" => '<h1 style="text-align: center;">Одна из моих целей:</h1>
&nbsp;<img title="Загружено из буфера обмена Mon Oct 15 2012 23:56:38 GMT+0600 (YEKT)" src="data/2859/clipboard_445.png" style="cursor: default; ">
<p>Примерно такой дом хочу. И естественно с прислугой, а то я не очень люблю мыть пол.</p>

<p>
<ul>
<li><strike>Деньги почти скопил</strike></li>
<li>Докопить деньги</li>
<li>Найти <span style="background-color: rgb(255, 255, 0);">хорошего</span> риелтора</li>
</ul><div>
<table id="table63637">
<tbody>
<tr>
<td><i>№</i></td>

<td><i class="current">Что нужно иметь, чтобы иметь такой дом</i></td>

<td><i>Сколько</i></td>
</tr>

<tr>
<td>1.</td>

<td class="current">Деньги</td>

<td>Много</td>
</tr>

<tr>
<td>2.</td>

<td>Желание</td>

<td>Можно чуть-чуть</td>
</tr>
</tbody>
</table>
</div>
</p>',
			"date1" => "2016-09-01 14:00:00",
			"type" => "default"
		));
		$this->create_node(array(
			"id" => $tt,
			"parent" => $tt,
			"position" => 2,
			"title" => "Дорогой вместительный автомобиль (кликните в дело, тогда календарь переместится на это дело)",
			"date1" => "2014-09-01 14:00:00",
			"text" => '<h1>Хочу такую в собственность</h1>
&nbsp;<iframe width="440" height="280" src="http://www.youtube.com/embed/G8p9_rKVQ4s?feature=player_detailpage" frameborder="0" allowfullscreen=""></iframe>
<ul>
<li>Можно и Бентли.</li>
<li>На <strike>худой конец</strike>, можно и Майбах.</li>
</ul>',
			"type" => "default"
		));
		$this->create_node(array(
			"id" => $tt,
			"parent" => $tt,
			"position" => 2,
			"title" => "Быть здоровым и богатым",
			"text" => "Как бык и Ротшильд",
			"type" => "default"
		));
		$this->create_node(array(
			"id" => $tt,
			"parent" => $tt,
			"position" => 2,
			"title" => "Никогда ни чего не забывать и не иметь просроченных дел",
			"date1" => "2012-10-15 12:00:00",
			"text" => "Для примера, это дело просрочено<br>Кликните в него и перетащите в календаре.",
			"type" => "default"
		));


		$tt = $this->create_node(array(
			"id" => 1,
			"position" => 1,
			"title" => "Рабочие дела",
			"type" => "drive"
		));

		$tt = json_decode($tt);
		$tt = $tt->id;
		
		$tt = $this->create_node(array(
			"id" => $tt,
			"parent" => $tt,
			"position" => 0,
			"title" => "Следующие дела",
			"type" => "default"
		));

		$tt = json_decode($tt);
		$tt = $tt->id;
		
		$this->create_node(array(
			"id" => $tt,
			"parent" => $tt,
			"position" => 0,
			"title" => "Разобраться с 4tree.ru, это легко сделать, открыв самую нижнюю папку этого дерева, там есть описание возможностей",
			"text" => "Тут ни чего сложного, главное привыкнуть. <br>Вы далеко не первый пройдёте этот путь",
			"type" => "default"
		));
		$this->create_node(array(
			"id" => 1,
			"position" => 2,
			"title" => "Личные дела",
			"type" => "drive"
		));
		$this->create_node(array(
			"id" => 1,
			"position" => 3,
			"title" => "ЗАМЕТКИ",
			"type" => "drive"
		));
		$this->create_node(array(
			"id" => 1,
			"position" => 4,
			"title" => "_ДНЕВНИК",
			"text" => 'Обратите внимание в верхнее меню, там есть <b>Дневник</b>.<br>Кликнув туда, вы откроете событие сегодняшнего дня и сможете вести заметку. Там же, внизу есть календарь, где можно выбирать любую дату.<br>Это очень помогает вести ежедневный дневник, чтобы помнить, когда и что произошло. Все заметки дневника дублируются в эту папку в древовидном виде. Что позволяет вести <a href="http://www.improvement.ru/zametki/dnevnik/" target="_blank">систему сворачивающихся дневников</a>',
			"type" => "drive"
		));
	}
	}
}

?>