import React from 'react';
import './FamilySelectScreen.css';
import LogoImage from '../assets/titleIcon.png';
import { useNavigate } from 'react-router-dom';

/**
 * FamilySelectScreen (家族選択画面) コンポーネント
 * 役割: ログイン/新規登録後に、既存の家族に参加するか、
 * 新しい家族グループを作成して招待するかを選択する画面
 */
const FamilySelectScreen = () => {
  const navigate = useNavigate();

  /**
   * 「家族に入る」ボタンがクリックされたときの処理
   * 既存の家族グループに招待コードで参加する画面へ遷移
   */
  const handleJoinFamily = () => {
    console.log('家族に入るボタンがクリックされました');
    navigate('/join-family');
  };

  /**
   * 「家族を招待する」ボタンがクリックされたときの処理
   * 新しい家族グループを作成して招待コードを発行する画面へ遷移
   */
  const handleInviteFamily = () => {
    console.log('家族を招待するボタンがクリックされました');
    navigate('/invite-family');
  };

  return (
    // 画面全体のコンテナ
    <div className="family-select-container">
      {/* タブレット・PC版の装飾：左上の静止した丸（768px以上で表示） */}
      <div className="family-select-decoration family-select-decoration-top-left">
        <div className="family-select-blob family-select-blob-1"></div>
        <div className="family-select-blob family-select-blob-2"></div>
      </div>

      {/* タブレット・PC版の装飾：右下の静止した丸（768px以上で表示） */}
      <div className="family-select-decoration family-select-decoration-bottom-right">
        <div className="family-select-blob family-select-blob-3"></div>
        <div className="family-select-blob family-select-blob-4"></div>
      </div>

      {/* コンテンツエリア */}
      <div className="family-select-content">
        {/* ロゴエリア */}
        <div className="family-select-logo-section">
          <div className="family-select-logo-placeholder">
            <img src={LogoImage} alt="FamLink Logo" />
          </div>
        </div>

        {/* 説明テキスト */}
        <div className="family-select-description">
          <p className="family-select-description-text">
            家族グループに参加して
            <br />
            つながりましょう
          </p>
        </div>

        {/* ボタンエリア */}
        <div className="family-select-button-section">
          {/* 家族に入るボタン */}
          <button
            className="family-select-button join-button"
            onClick={handleJoinFamily}
          >
            家族に入る
          </button>

          {/* 家族を招待するボタン */}
          <button
            className="family-select-button invite-button"
            onClick={handleInviteFamily}
          >
            家族を招待する
          </button>
        </div>
      </div>
    </div>
  );
};

export default FamilySelectScreen;