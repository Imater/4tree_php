<?php
require_once('Zend/Mail/Storage/Pop3.php');
/////////////////////////////////////////////// ���� ������� ���������� �� �����
$oImap = new Zend_Mail_Storage_Pop3(array('host' => 'mail.4tree.ru',
										 'user'=> '4tree@4tree.ru',
										 'password' => 'uuS4foos_VE'));


//$oImap = new Imap('{mail.example.ua:993/imap/ssl/novalidate-cert/user="robotmail"}', 'robotmail', 'robotpass');

//$oImap = new imap_open('{mail.4tree.ru}', '4tree@4tree.ru', 'uuS4foos_VE');

$aCheck = $oImap->checkMailbox();
if ($aCheck && $aCheck['Nmsgs']) {
    $aListEmail = $oImap->getEmailList();
    // ������ �� ������� �����
    foreach ($aListEmail as $iMailId => $aMailData) {
        $aLoadFile = array();
        $aMsgInfo = $oImap->getMsgInfo($aMailData['msgno']);
        $sSender = $aMsgInfo['from'][0]['mailbox'] . '@' . $aMsgInfo['from'][0]['host'];
        echo ' �����������: ' . $sSender . ' :: ����: ' . $aMsgInfo['subject'] . " \n";
        // ������ �� ��������������
        if (preg_match('/^(Re):.*$/is', $aMsgInfo['subject'])) {
            $oImap->delete($iMailId);
            continue;
        }
        $oImap->fetchBody($iMailId);
        $aEmailAttach = $oImap->getAttach();
        // �������� �������� ��������� � ����
        foreach ($oImap->getIncMap() as $sIncludeFileName) {
            if (isset($aEmailAttach[$sIncludeFileName])) {
                unset($aEmailAttach[$sIncludeFileName]);
            }
        }
        if (!empty($aEmailAttach)) {
            foreach ($aEmailAttach as $sAttachName => $sValue) {
                $sLoadFile = TMPPATH . '/' . $iMailId . '_' . $sAttachName;
                $rFh = fopen($sLoadFile, 'wb');
                fputs($rFh, $sValue);
                fclose($rFh);

                if (preg_match('/.*?\.zip$/i', $sLoadFile)) {
                    $rZip = zip_open($sLoadFile);
                    if (is_resource($rZip)) {
                        while ($rZipFile = zip_read($rZip)) {
                            $sZipFileName = zip_entry_name($rZipFile);
                            $sZipFilePath = TMPPATH . '/' . $iMailId . '_' . $sZipFileName;
                            $rFh = fopen($sZipFilePath, 'wb');
                            if ($rFh) {
                                while ($sFileData = zip_entry_read($rZipFile)) {
                                    fwrite($rFh, $sFileData);
                                }
                                fclose($rFh);
                                $aLoadFileInfo = pathinfo($sZipFilePath);
                                $aLoadFile[$sZipFilePath] = $aLoadFileInfo;
                            }
                        }
                        zip_close($rZip);
                    } else {
                        //Error open zip
                    }
                    unlink($sLoadFile);     // �������� ������
                } else {
                    $aLoadFileInfo = pathinfo($sLoadFile);
                    $aLoadFile[$sLoadFile] = $aLoadFileInfo;
                }
            } // ������ �� ������� ��������

            foreach ($aLoadFile as $sLoadFilePath => $aLoadFileInfo) {
                //
                // ������ ���������� �� ������
                //
            }
        } else {
            // ��� ��������� ������
        }

        // �������� ���� ��������� ������
        foreach ($aLoadFile as $sLoadFilePath => $aLoadFileInfo) {
            unlink($sLoadFilePath);
        }
        unset($aLoadFile);
        // �������� ������
        if (IS_LIVE) {
            //$oImap->delete($iMailId);
        }
    } // ������ �� ������� �����
} else {
    // ������
}
?>
