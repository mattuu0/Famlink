import React from 'react';
import './Title.css';
import LogoImage from '../assets/titleIcon.png';

/**
 * FamLinkアプリのタイトル画面コンポーネント
 * 中央にロゴを配置し、背景にアニメーションする装飾を表示
 */
const Title = () => {
  return (
    <div className="title-container">
      {/* 左上の装飾：ぐにゃぐにゃ動く丸 */}
      <div className="decoration decoration-top-left">
        <div className="blob blob-1"></div>
        <div className="blob blob-2"></div>
      </div>

      {/* 右下の装飾：ぐにゃぐにゃ動く丸 */}
      <div className="decoration decoration-bottom-right">
        <div className="blob blob-3"></div>
        <div className="blob blob-4"></div>
      </div>

      {/* 中央のロゴエリア：ここに画像を差し込む */}
      <div className="logo-container">
        {/* ロゴ画像を入れる場所 */}
        <div className="logo-placeholder">
          {<img src={LogoImage} alt="FamLink Logo" />}
          {/* 上のコメントを外して、srcに画像パスを指定してください */}
        </div>
      </div>
    </div>
  );
};

export default Title;