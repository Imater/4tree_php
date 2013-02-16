<?php

/**
 * ������ � �������� ������ Imap
 *
 * @example
 * $oImap = new Imap('{pop.ua.fm:110/pop3}', 'myemail@ua.fm', 'mypass');
 * $aBoxList = $oImap->getBoxList('{pop.ua.fm:110/pop3}');
 * $aCheck = $oImap->checkMailbox();
 * if ($aCheck) {
 *     $iMsgNum = $oImap->num_msg();
 *     $iUid = $oImap->uid(3);
 *     $aListEmail = $oImap->getEmailList();
 *     foreach ($aListEmail as $iUid => $aValue) {
 *         $aMsgInfo = $oImap->getMsgInfo($aValue['msgno']);
 *         if (preg_match('/^(Re):.*$/is', $aMsgInfo['subject'])) {
 *             $oImap->delete($iUid);
 *             continue;
 *         }
 *         $oImap->fetchBody($iUid);
 *         $aEmailText = $oImap->getText();
 *         $aEmailInc = $oImap->getIncMap();
 *         $aEmailAttach = $oImap->getAttach();
 *         foreach ($aEmailAttach as $sName => $sValue) {
 *             file_put_contents('makedir/' . $sName, $sValue);
 *         }
 *     }
 * }
 * $aError = $oImap->getError();
 *
 * @category    Alt
 * @package     Alt_Imap
 * @author      Gordon Freeman <toxa82@gmail.com>
 * @copyright   Copyright (c) 2012+ Gordon Freeman
 * @license     New BSD License
 * All rights reserved.
 *
 * Redistribution and use in source and binary forms, with or without modification,
 * are permitted provided that the following conditions are met:
 * - Redistributions of source code must retain the above copyright notice, this list
 *   of conditions and the following disclaimer.
 * - Redistributions in binary form must reproduce the above copyright notice, this
 *   list of conditions and the following disclaimer in the documentation and/or
 *   other materials provided with the distribution.
 * - Neither the name of the Gordon Freeman nor the names of its contributors may be
 *   used to endorse or promote products derived from this software without specific
 *   prior written permission.
 * THIS SOFTWARE IS PROVIDED BY THE COPYRIGHT HOLDERS AND CONTRIBUTORS "AS IS" AND
 * ANY EXPRESS OR IMPLIED WARRANTIES, INCLUDING, BUT NOT LIMITED TO, THE IMPLIED
 * WARRANTIES OF MERCHANTABILITY AND FITNESS FOR A PARTICULAR PURPOSE ARE DISCLAIMED.
 * IN NO EVENT SHALL THE COPYRIGHT HOLDER OR CONTRIBUTORS BE LIABLE FOR ANY DIRECT,
 * INDIRECT, INCIDENTAL, SPECIAL, EXEMPLARY, OR CONSEQUENTIAL DAMAGES (INCLUDING,
 * BUT NOT LIMITED TO, PROCUREMENT OF SUBSTITUTE GOODS OR SERVICES; LOSS OF USE,
 * DATA, OR PROFITS; OR BUSINESS INTERRUPTION) HOWEVER CAUSED AND ON ANY THEORY OF
 * LIABILITY, WHETHER IN CONTRACT, STRICT LIABILITY, OR TORT (INCLUDING NEGLIGENCE
 * OR OTHERWISE) ARISING IN ANY WAY OUT OF THE USE OF THIS SOFTWARE, EVEN IF ADVISED
 * OF THE POSSIBILITY OF SUCH DAMAGE.
 *
 * @version     $Id:1.0 {Imap.php} {07.05.2012} {23:16:56} altermann $
 */
class Alt_Imap
{

    /**
     * ������ ����������
     * @var resource
     * @access protected
     */
    protected $rMail;

    /**
     * ������ �������� � �����
     * @var string
     * @access protected
     */
    protected $sConnect;

    /**
     * ��������� � ������� ��-���������
     * @var string
     * @access protected
     */
    protected $sCharsetIn;

    /**
     * �������� ��������� ������ [windows-1251]
     * @var string
     * @access protected
     */
    protected $sCharsetOut = 'windows-1251';

    /**
     * ������ �������� ���������
     * @var stdClass
     * @access protected
     */
    protected $oCheck;

    /**
     * ���������� � ������� ��������� � �����
     * @var array � ������ � ������ ����������� ������ ������� �������� uid, � ������� - ���������� �����
     * @access protected
     */
    protected $aMailListInfo = array();

    /**
     * ����� �� ������
     * @var array
     * @access protected
     */
    protected $aMailText = array();

    /**
     * ���������� �� ������
     * @var array
     * @access protected
     */
    protected $aMailAttach = array();

    /**
     * ������ id � ����� ����� �� ������
     * @var array
     * @access protected
     */
    protected $aMailInc = array();

    /**
     * ������ �������������� mime-�����
     * @var array
     * @access protected
     */
    protected $aMimeType = array(
        0 => 'text',
        1 => 'multipart',
        2 => 'message',
        3 => 'application',
        4 => 'audio',
        5 => 'image',
        6 => 'video',
        7 => 'other',
    );

    /**
     * ������ �������������� ��������� ���������
     * @var array
     * @access protected
     */
    protected $aEncoding  = array(
        0 => '7bit',
        1 => '8bit',
        2 => 'binary',
        3 => 'base64',
        4 => 'quoted-printable',
        5 => 'other',
    );

    /**
     * �������� ���������� ������ � ����������� � ��������� �������
     *
     * @param string $sConnect ������ �����������
     * @param string $sLogin �����
     * @param string $sPass ������
     * @param int $iOption �������������� ����� ����������� [NIL]
     * @param int $iRetry ���-�� ������� ����������� [0]
     * @access public
     */
    public function __construct($sConnect, $sLogin, $sPass, $iOption = NIL, $iRetry = 0)
    {
        $this->sConnect = $sConnect;
        $this->rMail = @imap_open($sConnect, $sLogin, $sPass, $iOption, $iRetry);
    }

    /**
     * ��������� ������ �������� ������
     *
     * @param string $sPattern ������� ������ �������� ������ [*]
     * @return array
     * @access public
     */
    public function getBoxList($sPattern = '*')
    {
        if ($this->rMail) {
            imap_errors();
            return imap_list($this->rMail, $this->sConnect, $sPattern);
        } else {
            return false;
        }
    }

    /**
     * �������� � ��������� ���������� � ��������� ��������� �����
     *
     * @return array|bool (Unread, Deleted, Nmsgs, Size, Date, Driver, Mailbox, Recent)
     * ��� false � ������ ������ �����������
     * @access public
     */
    public function checkMailbox()
    {
        if ($this->rMail) {
            $aData = array();
            $this->oCheck = imap_mailboxmsginfo($this->rMail);
            foreach ($this->oCheck as $sKey => $sVal) {
                $aData[$sKey] = $sVal;
            }
            return $aData;
        } else {
            return false;
        }
    }

    /**
     * ��������� ������ ��������� � �������� ����� <br/>
     * � ������ � ������ ����������� ������ ������� �������� uid, � ������� - ���������� �����
     *
     * @param bool $bFullInfo �������� ������ ���������� � ������� [true]
     * @return array uid=>(subject,from,to,date,message_id,size,uid,msgno,recent,flagged,answered,deleted,seen,draft,udate)
     * @access public
     */
    public function getEmailList($bFullInfo = true)
    {
        $this->aMailListInfo = array();
        if ($bFullInfo) {
            $aEmailList = imap_fetch_overview($this->rMail, '1:' . imap_num_msg($this->rMail));
            foreach ($aEmailList as $iKey => $oVal) {
                $this->aMailListInfo[$oVal->uid] = $this->decodeHeader($oVal);
            }
        } else {
            $aEmailList = imap_headers($this->rMail);
            foreach ($aEmailList as $iKey => $sVal) {
                $this->aMailListInfo[$iKey + 1] = $sVal;
            }
        }

        return $this->aMailListInfo;
    }

    /**
     * ��������� �������� ���������� � ���������
     *
     * @param int $iNum ���������� ����� ��������� � �����
     * @return array
     * @access public
     */
    public function getMsgInfo($iNum)
    {
        $oMsgHead = imap_headerinfo($this->rMail, $iNum);
        return $this->decodeHeader($oMsgHead);
    }

    /**
     * ��������� ������ ���������
     *
     * @param int $iMsgUid ID ���������
     * @return array
     * @access public
     */
    public function fetchBody($iMsgUid)
    {
        $this->aMailText = $this->aMailAttach = $this->aMailInc = array();
        $oStructure = imap_fetchstructure($this->rMail, $iMsgUid, FT_UID);
        if ($oStructure) {
            if (!empty($oStructure->parts) && is_array($oStructure->parts)) {
                // ��� ���������, ������������ �����
                foreach ($oStructure->parts as $iKey => $oVal) {
                    $this->getPart($oVal, $iMsgUid, $iKey + 1);
                }
            } else {
                $this->getPart($oStructure, $iMsgUid);
            }
            return true;
        } else {
            return false;
        }
    }

    /**
     * ��������� ������ �� ������ ������
     *
     * @param stdClass $oStructure ���� � ��������� email-�����
     * @param int $iMsgUid ID ���������
     * @param int|string $mPart ����� ����� email
     * @return void
     * @access protected
     */
    protected function getPart(stdClass $oStructure, $iMsgUid, $mPart = 0)
    {
        $mPart = ($mPart == 0 ? 1 : $mPart);
        $sText = imap_fetchbody($this->rMail, $iMsgUid, $mPart, FT_UID);
        if ($sText) {
            if ($oStructure->type == 0)  { // ��� text, �������� �����
                $this->aMailText[] = trim($this->decodeBody($sText, $oStructure));
            } elseif ($oStructure->type == 1) { // ��� multipart
                if (!empty($oStructure->parts) && is_array($oStructure->parts)) {
                    // ������������ �����
                    foreach ($oStructure->parts as $iKey => $oVal) {
                        $iKey += 1;
                        $mPartSub = ($mPart == 0 ? $iKey : ($mPart . '.' . $iKey));
                        $this->getPart($oVal, $iMsgUid, $mPartSub);
                    }
                }
            } elseif ($oStructure->type == 2)  { // ��� message
                // �������� �����
                $this->aMailText[] = trim($this->decodeBody($sText, $oStructure));
//                if (!empty($oStructure->parts) && is_array($oStructure->parts)) {
//                    foreach ($oStructure->parts as $iKey => $oVal) {
//                        $this->getPart($oVal, $iMsgUid, ($mPart . '.' . $iKey + 1));
//                    }
//                }
            } elseif ($oStructure->ifid)  { // ���������� �������� � html
                if ($oStructure->type == 5 && $oStructure->ifparameters) {
                    // �������� �������� ���������� � HTML ������
                    $this->getFile($oStructure, $sText);
                }
            } elseif ($oStructure->ifdisposition) {
                if (strcasecmp($oStructure->disposition, 'attachment') == 0) {
                    // �������� ��������� ����
                    $this->getFile($oStructure, $sText);
                } elseif (strcasecmp($oStructure->disposition, 'inline') == 0) {
                    // �������� ��������� ���� ��� �����
                    if (!$this->getFile($oStructure, $sText)) {
                        // �������� �����
                        $this->aMailText[] = trim($this->decodeBody($sText, $oStructure));
                    }
                }
            } else {
                $this->aMailText[] = trim($this->decodeBody($sText, $oStructure));
            }
        }
    }

    /**
     * ��������� ����� �� ������ ������
     *
     * @param stdClass $oStructure ���� � ��������� email-�����
     * @param string $sText ����� email-�����
     * @return boolean
     */
    protected function getFile(stdClass $oStructure, $sText)
    {
        if ($oStructure->ifdparameters) {
            $sFileName = $this->decodeHeader($oStructure->dparameters[0]->value);
        } elseif ($oStructure->ifparameters) {
            $sFileName = $this->decodeHeader($oStructure->parameters[0]->value);
        }
        if (!empty($sFileName)) {
            $this->aMailAttach[$sFileName] = $this->decodeBody($sText, $oStructure);
            if ($oStructure->ifid) {
                $sId = strtr($oStructure->id, array('<' => '', '>' => ''));
                $this->aMailInc[$sId] = $sFileName;
            }
            return true;
        } else {
            return false;
        }
    }

    /**
     * �������� ������
     *
     * @return bool
     * @access public
     */
    public function send()
    {
        $aEnvelope['from'] = 'a.falalieiev@ecocontrol.com.ua';
        $aEnvelope['to'] = 'toxa82@gmail.com';
        $aEnvelope['subject'] = 'newmail';
        //$aEnvelope['cc'] = 'bar@example.com';

        $aPart1['type'] = TYPEMULTIPART;
        $aPart1['subtype'] = 'mixed';

        $sFilename = 'rec.txt';
        $fp = fopen($sFilename, 'r');
        $sContents = fread($fp, filesize($sFilename));
        fclose($fp);

        $aPart2['type'] = TYPEAPPLICATION;
        $aPart2['encoding'] = ENCBINARY;
        $aPart2['subtype'] = 'octet-stream';
        $aPart2['filename'] = $sFilename;
        $aPart2['description'] = basename($sFilename);
        $aPart2['contents.data'] = $sContents;

        $aPart3['type'] = TYPETEXT;
        $aPart3['subtype'] = 'plain';
        $aPart3['description'] = 'description3';
        $aPart3['contents.data'] = 'contents.data3\n\n\n\t';

        $aBody[1] = $aPart1;
        $aBody[2] = $aPart2;
        $aBody[3] = $aPart3;

        echo nl2br(imap_mail_compose($aEnvelope, $aBody));
        //imap_expunge();
        //imap_reopen($this->rMail, '{pop.ua.fm:110/pop3}');
        //imap_append($this->rMail, '{mail.ecocontrol.com.ua:993/imap/ssl/novalidate-cert/user="a.falalieiev@ecocontrol.com.ua"}INBOX.Sent', imap_mail_compose($aEnvelope, $aBody));
    }

    /**
     * �������� ���������
     *
     * @param int $iMsgUid ID ���������
     * @param bool $bNow ��������� �������� ����� [false]
     * @return bool
     * @access public
     */
    public function delete($iMsgUid, $bNow = false)
    {
        $bDel = imap_delete($this->rMail, $iMsgUid, FT_UID);
        if ($bNow && $bDel) {
            return imap_expunge($this->rMail);
        } else {
            return $bDel;
        }
    }

    /**
     * ������������� ���������� �� ���������� ��������� ����:<br/>
     * =?KOI8-R?B?0tXT08vJyi5jc3Y=?=
     *
     * @param array|string $mValue �������������� ������
     * @return string ��������������� ������
     * @access protected
     */
    protected function decodeHeader($mValue)
    {
        $aReturn = array();
        if (is_array($mValue) || $mValue instanceof stdClass) {
            foreach ($mValue as $sKey => $mVal) {
                $aReturn[$sKey] = $this->decodeHeader($mVal);
            }
            return $aReturn;
        } elseif (is_int($mValue)) {
            return $mValue;
        } else {
            $iKey = 0;
            $aData = imap_mime_header_decode($mValue);
            $aDataOut = array();
            foreach ($aData as $oValue) {
                if (empty($sCharset) || $sCharset != $oValue->charset) {
                    $sCharset = $oValue->charset;
                    $iKey++;
                }
                $aDataOut[$iKey] = array(
                    'charset' => $sCharset,
                    'text' => (isset($aDataOut[$iKey]['text']) ? $aDataOut[$iKey]['text'] : '') . $oValue->text,
                );
            }
            $aRet = array();
            foreach ($aDataOut as $aValue) {
                $aRet[] = $this->iconvCharset($aValue['text'], $aValue['charset']);
            }
            return trim(implode('', $aRet));
        }
    }

    /**
     * ������������� ������ � ������ ���������
     *
     * @param string $sText ������������ �����
     * @param stdClass $oStructure ���� � ��������� email-�����
     * @return string
     * @access protected
     */
	protected function decodeBody($sText, stdClass $oStructure)
    {
        switch ($oStructure->encoding) {
            case 0:
            case 1:
                $sText = imap_8bit($sText);
                $sText = imap_qprint($sText);
                break;

            case 2:
                $sText = imap_binary($sText);
                break;

            case 3:
            default:
                $sText = imap_base64($sText);
                break;

            case 4:
                $sText = imap_qprint($sText);
                break;
        }
        if ($oStructure->ifparameters) {
            foreach ($oStructure->parameters as $oVal) {
                if (strcasecmp($oVal->attribute, 'charset') == 0) {
                    $sText = $this->iconvCharset($sText, $oVal->value);
                    continue;
                }
            }
        }
        return $sText;
    }

    /**
     * ������������� ������ �� ����� ��������� � ������
     *
     * @param string $sText ����� ��� ���������������
     * @param string $sCharset ���������
     * @return string
     * @access protected
     */
    protected function iconvCharset($sText, $sCharset)
    {
        $sCharset = strtolower($sCharset);
        if (!empty($this->sCharsetIn) && strcasecmp($sCharset, 'default') == 0) {
            $sCharset = $this->sCharsetIn;
        }
        if ($sCharset !== $this->sCharsetOut && strcasecmp($sCharset, 'default') != 0
            &&  strcasecmp($sCharset, 'x-unknown') != 0) {
            $sText = iconv($sCharset, $this->sCharsetOut, $sText);
        }
        return $sText;
    }

    /**
     * ��������� MIME ����
     *
     * @param stdClass $oStructure ���� � ��������� email ��� ��� �����
     * @return string
     * @access protected
     */
	protected function getMimeType(stdClass $oStructure)
    {
        if ($oStructure->ifsubtype) {
            $sMimeType = $this->aMimeType[(int)$oStructure->type] . '/' . strtolower($oStructure->subtype);
        } else {
            $sMimeType = $this->aMimeType[(int)$oStructure->type];
        }
        return $sMimeType;
    }

    /**
     * ��������� ����� ������ �� ������
     *
     * @return array
     * @access public
     */
    public function getText()
    {
        return $this->aMailText;
    }

    /**
     * ��������� ������ id ������ � ����� �����
     *
     * @return array
     * @access public
     */
    public function getIncMap()
    {
        return $this->aMailInc;
    }

    /**
     * ��������� �������� �� ������
     *
     * @return array
     * @access public
     */
    public function getAttach()
    {
        return $this->aMailAttach;
    }

    /**
     * ��������� �������� ������� �������� ���������
     *
     * @return string
     * @access public
     */
    public function getCharsetOut()
    {
        return $this->sCharsetOut;
    }

    /**
     * ��������� �������� ������� �������� ���������
     *
     * @param string $sCharsetOut ��������� ������ �� ������
     * @return Alt_Imap
     * @access public
     */
    public function setCharsetOut($sCharsetOut)
    {
        $this->sCharsetOut = $sCharsetOut;
        return $this;
    }

    /**
     * ��������� �������� ��������� ����� �� ��������� ������ default
     *
     * @param string $sCharsetIn ���������
     * @return Alt_Imap
     * @access public
     */
    public function setCharsetDefault($sCharsetIn)
    {
        $this->sCharsetIn = $sCharsetIn;
        return $this;
    }

    /**
     * ������� ������ ����������� ������� IMAP. ��������� ������ ���������� imap-������
     *
     * @param string $sFunction �������� ������� ��� imap_
     * @param array $aArguments ��������� �������
     * @return mixed
     * @access public
     */
    public function __call($sFunction, $aArguments)
    {
        $sFunction = 'imap_' . strtolower($sFunction);
        if (function_exists($sFunction)) {
            array_unshift($aArguments, $this->rMail);
            return call_user_func_array($sFunction, $aArguments);
        }
    }

    /**
     * ��������� ������ ������
     *
     * @return array|bool
     * @access public
     */
    public function getError()
    {
        return imap_errors();
    }

    /**
     * �������� ����������� � �����
     *
     * @access public
     */
    public function __destruct()
    {
        if (is_resource($this->rMail)) {
            imap_errors();
            imap_close($this->rMail, CL_EXPUNGE);
        }
    }

}

